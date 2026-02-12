package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"sort"
	"time"

	"github.com/Azure/azure-sdk-for-go/sdk/azcore/to"
	"github.com/Azure/azure-sdk-for-go/sdk/azidentity"
	"github.com/Azure/azure-sdk-for-go/sdk/resourcemanager/costmanagement/armcostmanagement"
	"github.com/Azure/azure-sdk-for-go/sdk/resourcemanager/resources/armsubscriptions"
	"github.com/mark3labs/mcp-go/mcp"
	"github.com/mark3labs/mcp-go/server"
)

// CostInfo represents cost data for a time period
type CostInfo struct {
	StartDate string                   `json:"start_date"`
	EndDate   string                   `json:"end_date"`
	Services  []ServiceCost            `json:"services"`
	Total     float64                  `json:"total"`
	Currency  string                   `json:"currency"`
}

// ServiceCost represents cost for a single service
type ServiceCost struct {
	Name   string  `json:"name"`
	Amount float64 `json:"amount"`
	Unit   string  `json:"unit"`
}

// CostComparison represents cost comparison between two periods
type CostComparison struct {
	CurrentMonth CostInfo `json:"current_month"`
	LastMonth    CostInfo `json:"last_month"`
	Difference   float64  `json:"difference"`
	PercentChange float64 `json:"percent_change"`
}

// SubscriptionInfo represents Azure subscription details
type SubscriptionInfo struct {
	SubscriptionID   string `json:"subscription_id"`
	DisplayName      string `json:"display_name"`
	State            string `json:"state"`
}

// SubscriptionCostInfo represents costs for a single subscription
type SubscriptionCostInfo struct {
	SubscriptionID   string      `json:"subscription_id"`
	SubscriptionName string      `json:"subscription_name"`
	Costs            *CostInfo   `json:"costs,omitempty"`
	Error            string      `json:"error,omitempty"`
}

// AllSubscriptionsCostInfo represents aggregated costs across all subscriptions
type AllSubscriptionsCostInfo struct {
	Subscriptions []SubscriptionCostInfo `json:"subscriptions"`
	Aggregated    *CostInfo              `json:"aggregated"`
	TotalCost     float64                `json:"total_cost"`
	Currency      string                 `json:"currency"`
}

// SubscriptionCostComparison represents cost comparison for a single subscription
type SubscriptionCostComparison struct {
	SubscriptionID   string       `json:"subscription_id"`
	SubscriptionName string       `json:"subscription_name"`
	CurrentMonth     *CostInfo    `json:"current_month,omitempty"`
	PreviousMonth    *CostInfo    `json:"previous_month,omitempty"`
	Difference       float64      `json:"difference"`
	PercentChange    float64      `json:"percent_change"`
	Error            string       `json:"error,omitempty"`
}

// AllSubscriptionsCostComparison represents cost comparison across all subscriptions
type AllSubscriptionsCostComparison struct {
	Subscriptions       []SubscriptionCostComparison `json:"subscriptions"`
	AggregatedCurrent   *CostInfo                    `json:"aggregated_current"`
	AggregatedPrevious  *CostInfo                    `json:"aggregated_previous"`
	TotalCurrentCost    float64                      `json:"total_current_cost"`
	TotalPreviousCost   float64                      `json:"total_previous_cost"`
	TotalDifference     float64                      `json:"total_difference"`
	TotalPercentChange  float64                      `json:"total_percent_change"`
	Currency            string                       `json:"currency"`
	CurrentPeriod       string                       `json:"current_period"`
	PreviousPeriod      string                       `json:"previous_period"`
	DaysInCurrentPeriod int                          `json:"days_in_current_period"`
	DaysInPreviousPeriod int                         `json:"days_in_previous_period"`
}

// AzureClient wraps Azure SDK clients
type AzureClient struct {
	subscriptionID string // Optional - if empty, queries all subscriptions
	credential     *azidentity.DefaultAzureCredential
	costClient     *armcostmanagement.QueryClient
	subClient      *armsubscriptions.Client
}

func NewAzureClient(subscriptionID string) (*AzureClient, error) {
	credential, err := azidentity.NewDefaultAzureCredential(nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create Azure credential: %w", err)
	}

	costClient, err := armcostmanagement.NewQueryClient(credential, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create cost management client: %w", err)
	}

	subClient, err := armsubscriptions.NewClient(credential, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create subscriptions client: %w", err)
	}

	return &AzureClient{
		subscriptionID: subscriptionID,
		credential:     credential,
		costClient:     costClient,
		subClient:      subClient,
	}, nil
}

// ListSubscriptions returns all subscriptions the credential has access to
func (c *AzureClient) ListSubscriptions(ctx context.Context) ([]SubscriptionInfo, error) {
	var subscriptions []SubscriptionInfo

	pager := c.subClient.NewListPager(nil)
	for pager.More() {
		page, err := pager.NextPage(ctx)
		if err != nil {
			return nil, fmt.Errorf("failed to list subscriptions: %w", err)
		}

		for _, sub := range page.Value {
			if sub.SubscriptionID == nil {
				continue
			}

			displayName := *sub.SubscriptionID
			if sub.DisplayName != nil {
				displayName = *sub.DisplayName
			}

			state := "Unknown"
			if sub.State != nil {
				state = string(*sub.State)
			}

			// Only include enabled subscriptions
			if state == "Enabled" {
				subscriptions = append(subscriptions, SubscriptionInfo{
					SubscriptionID: *sub.SubscriptionID,
					DisplayName:    displayName,
					State:          state,
				})
			}
		}
	}

	return subscriptions, nil
}

func (c *AzureClient) GetSubscriptionInfo(ctx context.Context) (*SubscriptionInfo, error) {
	resp, err := c.subClient.Get(ctx, c.subscriptionID, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to get subscription info: %w", err)
	}

	displayName := c.subscriptionID
	if resp.DisplayName != nil {
		displayName = *resp.DisplayName
	}

	state := "Unknown"
	if resp.State != nil {
		state = string(*resp.State)
	}

	return &SubscriptionInfo{
		SubscriptionID: c.subscriptionID,
		DisplayName:    displayName,
		State:          state,
	}, nil
}

func (c *AzureClient) GetCostsByService(ctx context.Context, startDate, endDate time.Time) (*CostInfo, error) {
	scope := fmt.Sprintf("/subscriptions/%s", c.subscriptionID)

	queryDefinition := armcostmanagement.QueryDefinition{
		Type:      to.Ptr(armcostmanagement.ExportTypeActualCost),
		Timeframe: to.Ptr(armcostmanagement.TimeframeTypeCustom),
		TimePeriod: &armcostmanagement.QueryTimePeriod{
			From: to.Ptr(startDate),
			To:   to.Ptr(endDate),
		},
		Dataset: &armcostmanagement.QueryDataset{
			Granularity: to.Ptr(armcostmanagement.GranularityTypeDaily),
			Aggregation: map[string]*armcostmanagement.QueryAggregation{
				"totalCost": {
					Name:     to.Ptr("Cost"),
					Function: to.Ptr(armcostmanagement.FunctionTypeSum),
				},
			},
			Grouping: []*armcostmanagement.QueryGrouping{
				{
					Type: to.Ptr(armcostmanagement.QueryColumnTypeDimension),
					Name: to.Ptr("ServiceName"),
				},
			},
		},
	}

	resp, err := c.costClient.Usage(ctx, scope, queryDefinition, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to query costs: %w", err)
	}

	// Find column indices
	costIdx, serviceIdx, currencyIdx := -1, -1, -1
	if resp.Properties != nil && resp.Properties.Columns != nil {
		for i, col := range resp.Properties.Columns {
			if col.Name != nil {
				switch *col.Name {
				case "Cost", "PreTaxCost":
					costIdx = i
				case "ServiceName":
					serviceIdx = i
				case "Currency":
					currencyIdx = i
				}
			}
		}
	}

	// Aggregate costs by service
	costMap := make(map[string]float64)
	currency := "USD"

	if resp.Properties != nil && resp.Properties.Rows != nil && costIdx >= 0 && serviceIdx >= 0 {
		for _, row := range resp.Properties.Rows {
			if len(row) <= costIdx || len(row) <= serviceIdx {
				continue
			}

			cost, ok := row[costIdx].(float64)
			if !ok {
				continue
			}
			serviceName, ok := row[serviceIdx].(string)
			if !ok {
				continue
			}

			if currencyIdx >= 0 && len(row) > currencyIdx {
				if curr, ok := row[currencyIdx].(string); ok && curr != "" {
					currency = curr
				}
			}

			if cost > 0 {
				costMap[serviceName] += cost
			}
		}
	}

	// Convert to slice and sort by cost
	var services []ServiceCost
	var total float64
	for name, amount := range costMap {
		services = append(services, ServiceCost{
			Name:   name,
			Amount: amount,
			Unit:   currency,
		})
		total += amount
	}
	sort.Slice(services, func(i, j int) bool {
		return services[i].Amount > services[j].Amount
	})

	return &CostInfo{
		StartDate: startDate.Format("2006-01-02"),
		EndDate:   endDate.Format("2006-01-02"),
		Services:  services,
		Total:     total,
		Currency:  currency,
	}, nil
}

func (c *AzureClient) GetCurrentMonthCosts(ctx context.Context) (*CostInfo, error) {
	now := time.Now()
	startDate := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
	return c.GetCostsByService(ctx, startDate, now)
}

func (c *AzureClient) GetLastMonthCosts(ctx context.Context) (*CostInfo, error) {
	now := time.Now()
	lastMonth := now.AddDate(0, -1, 0)
	startDate := time.Date(lastMonth.Year(), lastMonth.Month(), 1, 0, 0, 0, 0, time.UTC)
	// Use same day of month for fair comparison
	endDate := time.Date(lastMonth.Year(), lastMonth.Month(), now.Day(), 0, 0, 0, 0, time.UTC)
	return c.GetCostsByService(ctx, startDate, endDate)
}

func (c *AzureClient) GetCostComparison(ctx context.Context) (*CostComparison, error) {
	currentCosts, err := c.GetCurrentMonthCosts(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get current month costs: %w", err)
	}

	lastCosts, err := c.GetLastMonthCosts(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get last month costs: %w", err)
	}

	diff := currentCosts.Total - lastCosts.Total
	var percentChange float64
	if lastCosts.Total > 0 {
		percentChange = (diff / lastCosts.Total) * 100
	}

	return &CostComparison{
		CurrentMonth:  *currentCosts,
		LastMonth:     *lastCosts,
		Difference:    diff,
		PercentChange: percentChange,
	}, nil
}

func (c *AzureClient) GetSixMonthTrend(ctx context.Context) ([]CostInfo, error) {
	var trend []CostInfo

	for i := 6; i >= 1; i-- {
		monthDate := time.Now().AddDate(0, -i, 0)
		startDate := time.Date(monthDate.Year(), monthDate.Month(), 1, 0, 0, 0, 0, time.UTC)
		endDate := time.Date(monthDate.Year(), monthDate.Month()+1, 0, 23, 59, 59, 0, time.UTC)

		costs, err := c.GetCostsByService(ctx, startDate, endDate)
		if err != nil {
			// Continue with empty data for this month
			trend = append(trend, CostInfo{
				StartDate: startDate.Format("2006-01-02"),
				EndDate:   endDate.Format("2006-01-02"),
				Services:  []ServiceCost{},
				Total:     0,
				Currency:  "USD",
			})
			continue
		}
		trend = append(trend, *costs)
	}

	return trend, nil
}

// GetCostsByServiceForSubscription queries costs for a specific subscription
func (c *AzureClient) GetCostsByServiceForSubscription(ctx context.Context, subscriptionID string, startDate, endDate time.Time) (*CostInfo, error) {
	scope := fmt.Sprintf("/subscriptions/%s", subscriptionID)

	queryDefinition := armcostmanagement.QueryDefinition{
		Type:      to.Ptr(armcostmanagement.ExportTypeActualCost),
		Timeframe: to.Ptr(armcostmanagement.TimeframeTypeCustom),
		TimePeriod: &armcostmanagement.QueryTimePeriod{
			From: to.Ptr(startDate),
			To:   to.Ptr(endDate),
		},
		Dataset: &armcostmanagement.QueryDataset{
			Granularity: to.Ptr(armcostmanagement.GranularityTypeDaily),
			Aggregation: map[string]*armcostmanagement.QueryAggregation{
				"totalCost": {
					Name:     to.Ptr("Cost"),
					Function: to.Ptr(armcostmanagement.FunctionTypeSum),
				},
			},
			Grouping: []*armcostmanagement.QueryGrouping{
				{
					Type: to.Ptr(armcostmanagement.QueryColumnTypeDimension),
					Name: to.Ptr("ServiceName"),
				},
			},
		},
	}

	resp, err := c.costClient.Usage(ctx, scope, queryDefinition, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to query costs: %w", err)
	}

	// Find column indices
	costIdx, serviceIdx, currencyIdx := -1, -1, -1
	if resp.Properties != nil && resp.Properties.Columns != nil {
		for i, col := range resp.Properties.Columns {
			if col.Name != nil {
				switch *col.Name {
				case "Cost", "PreTaxCost":
					costIdx = i
				case "ServiceName":
					serviceIdx = i
				case "Currency":
					currencyIdx = i
				}
			}
		}
	}

	// Aggregate costs by service
	costMap := make(map[string]float64)
	currency := "USD"

	if resp.Properties != nil && resp.Properties.Rows != nil && costIdx >= 0 && serviceIdx >= 0 {
		for _, row := range resp.Properties.Rows {
			if len(row) <= costIdx || len(row) <= serviceIdx {
				continue
			}

			cost, ok := row[costIdx].(float64)
			if !ok {
				continue
			}
			serviceName, ok := row[serviceIdx].(string)
			if !ok {
				continue
			}

			if currencyIdx >= 0 && len(row) > currencyIdx {
				if curr, ok := row[currencyIdx].(string); ok && curr != "" {
					currency = curr
				}
			}

			if cost > 0 {
				costMap[serviceName] += cost
			}
		}
	}

	// Convert to slice and sort by cost
	var services []ServiceCost
	var total float64
	for name, amount := range costMap {
		services = append(services, ServiceCost{
			Name:   name,
			Amount: amount,
			Unit:   currency,
		})
		total += amount
	}
	sort.Slice(services, func(i, j int) bool {
		return services[i].Amount > services[j].Amount
	})

	return &CostInfo{
		StartDate: startDate.Format("2006-01-02"),
		EndDate:   endDate.Format("2006-01-02"),
		Services:  services,
		Total:     total,
		Currency:  currency,
	}, nil
}

// GetAllSubscriptionsCosts queries costs across all accessible subscriptions
func (c *AzureClient) GetAllSubscriptionsCosts(ctx context.Context, startDate, endDate time.Time) (*AllSubscriptionsCostInfo, error) {
	subscriptions, err := c.ListSubscriptions(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to list subscriptions: %w", err)
	}

	result := &AllSubscriptionsCostInfo{
		Subscriptions: make([]SubscriptionCostInfo, 0, len(subscriptions)),
		Currency:      "USD",
	}

	// Aggregate service costs across all subscriptions
	aggregatedCosts := make(map[string]float64)
	var totalCost float64

	for _, sub := range subscriptions {
		subCostInfo := SubscriptionCostInfo{
			SubscriptionID:   sub.SubscriptionID,
			SubscriptionName: sub.DisplayName,
		}

		costs, err := c.GetCostsByServiceForSubscription(ctx, sub.SubscriptionID, startDate, endDate)
		if err != nil {
			subCostInfo.Error = err.Error()
		} else {
			subCostInfo.Costs = costs
			totalCost += costs.Total
			result.Currency = costs.Currency

			// Aggregate by service
			for _, svc := range costs.Services {
				aggregatedCosts[svc.Name] += svc.Amount
			}
		}

		result.Subscriptions = append(result.Subscriptions, subCostInfo)
	}

	// Build aggregated cost info
	var aggregatedServices []ServiceCost
	for name, amount := range aggregatedCosts {
		aggregatedServices = append(aggregatedServices, ServiceCost{
			Name:   name,
			Amount: amount,
			Unit:   result.Currency,
		})
	}
	sort.Slice(aggregatedServices, func(i, j int) bool {
		return aggregatedServices[i].Amount > aggregatedServices[j].Amount
	})

	result.Aggregated = &CostInfo{
		StartDate: startDate.Format("2006-01-02"),
		EndDate:   endDate.Format("2006-01-02"),
		Services:  aggregatedServices,
		Total:     totalCost,
		Currency:  result.Currency,
	}
	result.TotalCost = totalCost

	return result, nil
}

// GetAllSubscriptionsCurrentMonthCosts gets current month costs across all subscriptions
func (c *AzureClient) GetAllSubscriptionsCurrentMonthCosts(ctx context.Context) (*AllSubscriptionsCostInfo, error) {
	now := time.Now()
	startDate := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
	return c.GetAllSubscriptionsCosts(ctx, startDate, now)
}

// GetAllSubscriptionsCostComparison compares current month vs previous month costs across all subscriptions
func (c *AzureClient) GetAllSubscriptionsCostComparison(ctx context.Context) (*AllSubscriptionsCostComparison, error) {
	subscriptions, err := c.ListSubscriptions(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to list subscriptions: %w", err)
	}

	now := time.Now()

	// Current month: 1st of month to today
	currentStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
	currentEnd := now
	daysInCurrentPeriod := now.Day()

	// Previous month: 1st of last month to same day of last month (for fair comparison)
	lastMonth := now.AddDate(0, -1, 0)
	previousStart := time.Date(lastMonth.Year(), lastMonth.Month(), 1, 0, 0, 0, 0, time.UTC)
	// Use the same day of month, but cap at end of previous month
	lastDayOfPrevMonth := time.Date(now.Year(), now.Month(), 0, 0, 0, 0, 0, time.UTC).Day()
	previousEndDay := now.Day()
	if previousEndDay > lastDayOfPrevMonth {
		previousEndDay = lastDayOfPrevMonth
	}
	previousEnd := time.Date(lastMonth.Year(), lastMonth.Month(), previousEndDay, 23, 59, 59, 0, time.UTC)
	daysInPreviousPeriod := previousEndDay

	result := &AllSubscriptionsCostComparison{
		Subscriptions:        make([]SubscriptionCostComparison, 0, len(subscriptions)),
		Currency:             "CAD",
		CurrentPeriod:        fmt.Sprintf("%s to %s", currentStart.Format("2006-01-02"), currentEnd.Format("2006-01-02")),
		PreviousPeriod:       fmt.Sprintf("%s to %s", previousStart.Format("2006-01-02"), previousEnd.Format("2006-01-02")),
		DaysInCurrentPeriod:  daysInCurrentPeriod,
		DaysInPreviousPeriod: daysInPreviousPeriod,
	}

	// Aggregate costs
	currentCostMap := make(map[string]float64)
	previousCostMap := make(map[string]float64)
	var totalCurrentCost, totalPreviousCost float64

	for _, sub := range subscriptions {
		subComparison := SubscriptionCostComparison{
			SubscriptionID:   sub.SubscriptionID,
			SubscriptionName: sub.DisplayName,
		}

		// Get current month costs
		currentCosts, currentErr := c.GetCostsByServiceForSubscription(ctx, sub.SubscriptionID, currentStart, currentEnd)
		if currentErr != nil {
			subComparison.Error = fmt.Sprintf("current month: %v", currentErr)
		} else {
			subComparison.CurrentMonth = currentCosts
			totalCurrentCost += currentCosts.Total
			result.Currency = currentCosts.Currency
			for _, svc := range currentCosts.Services {
				currentCostMap[svc.Name] += svc.Amount
			}
		}

		// Get previous month costs
		previousCosts, previousErr := c.GetCostsByServiceForSubscription(ctx, sub.SubscriptionID, previousStart, previousEnd)
		if previousErr != nil {
			if subComparison.Error != "" {
				subComparison.Error += "; "
			}
			subComparison.Error += fmt.Sprintf("previous month: %v", previousErr)
		} else {
			subComparison.PreviousMonth = previousCosts
			totalPreviousCost += previousCosts.Total
			for _, svc := range previousCosts.Services {
				previousCostMap[svc.Name] += svc.Amount
			}
		}

		// Calculate difference and percent change for this subscription
		if subComparison.CurrentMonth != nil && subComparison.PreviousMonth != nil {
			subComparison.Difference = subComparison.CurrentMonth.Total - subComparison.PreviousMonth.Total
			if subComparison.PreviousMonth.Total > 0 {
				subComparison.PercentChange = (subComparison.Difference / subComparison.PreviousMonth.Total) * 100
			}
		}

		result.Subscriptions = append(result.Subscriptions, subComparison)
	}

	// Build aggregated current costs
	var currentServices []ServiceCost
	for name, amount := range currentCostMap {
		currentServices = append(currentServices, ServiceCost{
			Name:   name,
			Amount: amount,
			Unit:   result.Currency,
		})
	}
	sort.Slice(currentServices, func(i, j int) bool {
		return currentServices[i].Amount > currentServices[j].Amount
	})
	result.AggregatedCurrent = &CostInfo{
		StartDate: currentStart.Format("2006-01-02"),
		EndDate:   currentEnd.Format("2006-01-02"),
		Services:  currentServices,
		Total:     totalCurrentCost,
		Currency:  result.Currency,
	}

	// Build aggregated previous costs
	var previousServices []ServiceCost
	for name, amount := range previousCostMap {
		previousServices = append(previousServices, ServiceCost{
			Name:   name,
			Amount: amount,
			Unit:   result.Currency,
		})
	}
	sort.Slice(previousServices, func(i, j int) bool {
		return previousServices[i].Amount > previousServices[j].Amount
	})
	result.AggregatedPrevious = &CostInfo{
		StartDate: previousStart.Format("2006-01-02"),
		EndDate:   previousEnd.Format("2006-01-02"),
		Services:  previousServices,
		Total:     totalPreviousCost,
		Currency:  result.Currency,
	}

	// Calculate totals
	result.TotalCurrentCost = totalCurrentCost
	result.TotalPreviousCost = totalPreviousCost
	result.TotalDifference = totalCurrentCost - totalPreviousCost
	if totalPreviousCost > 0 {
		result.TotalPercentChange = (result.TotalDifference / totalPreviousCost) * 100
	}

	return result, nil
}

func main() {
	// Get subscription ID from environment (optional - if not set, will query all subscriptions)
	subscriptionID := os.Getenv("AZURE_SUBSCRIPTION_ID")

	// Create MCP server
	s := server.NewMCPServer(
		"cloud-doctor-mcp",
		"1.0.0",
		server.WithToolCapabilities(true),
	)

	// Tool: List all Azure subscriptions
	s.AddTool(mcp.NewTool("azure_list_subscriptions",
		mcp.WithDescription("List all Azure subscriptions the current credential has access to"),
	), func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		client, err := NewAzureClient("")
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("Failed to create Azure client: %v", err)), nil
		}

		subscriptions, err := client.ListSubscriptions(ctx)
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("Failed to list subscriptions: %v", err)), nil
		}

		data, _ := json.MarshalIndent(subscriptions, "", "  ")
		return mcp.NewToolResultText(string(data)), nil
	})

	// Tool: Get Azure subscription info (single subscription)
	s.AddTool(mcp.NewTool("azure_get_subscription_info",
		mcp.WithDescription("Get Azure subscription information including ID, display name, and state. Uses AZURE_SUBSCRIPTION_ID env var."),
	), func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		if subscriptionID == "" {
			return mcp.NewToolResultError("AZURE_SUBSCRIPTION_ID environment variable is required for this tool. Use azure_list_subscriptions to see available subscriptions."), nil
		}

		client, err := NewAzureClient(subscriptionID)
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("Failed to create Azure client: %v", err)), nil
		}

		info, err := client.GetSubscriptionInfo(ctx)
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("Failed to get subscription info: %v", err)), nil
		}

		data, _ := json.MarshalIndent(info, "", "  ")
		return mcp.NewToolResultText(string(data)), nil
	})

	// Tool: Get current month costs
	s.AddTool(mcp.NewTool("azure_get_current_month_costs",
		mcp.WithDescription("Get Azure costs for the current month, broken down by service"),
	), func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		client, err := NewAzureClient(subscriptionID)
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("Failed to create Azure client: %v", err)), nil
		}

		costs, err := client.GetCurrentMonthCosts(ctx)
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("Failed to get current month costs: %v", err)), nil
		}

		data, _ := json.MarshalIndent(costs, "", "  ")
		return mcp.NewToolResultText(string(data)), nil
	})

	// Tool: Get cost comparison
	s.AddTool(mcp.NewTool("azure_get_cost_comparison",
		mcp.WithDescription("Compare Azure costs between current month and last month (same period)"),
	), func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		client, err := NewAzureClient(subscriptionID)
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("Failed to create Azure client: %v", err)), nil
		}

		comparison, err := client.GetCostComparison(ctx)
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("Failed to get cost comparison: %v", err)), nil
		}

		data, _ := json.MarshalIndent(comparison, "", "  ")
		return mcp.NewToolResultText(string(data)), nil
	})

	// Tool: Get 6-month cost trend
	s.AddTool(mcp.NewTool("azure_get_cost_trend",
		mcp.WithDescription("Get Azure cost trend for the last 6 months"),
	), func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		client, err := NewAzureClient(subscriptionID)
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("Failed to create Azure client: %v", err)), nil
		}

		trend, err := client.GetSixMonthTrend(ctx)
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("Failed to get cost trend: %v", err)), nil
		}

		// Create summary
		type TrendSummary struct {
			Months []CostInfo `json:"months"`
			Summary struct {
				TotalSpend    float64 `json:"total_spend_6_months"`
				AverageMonthly float64 `json:"average_monthly"`
				HighestMonth  string  `json:"highest_month"`
				HighestAmount float64 `json:"highest_amount"`
				LowestMonth   string  `json:"lowest_month"`
				LowestAmount  float64 `json:"lowest_amount"`
			} `json:"summary"`
		}

		summary := TrendSummary{Months: trend}
		var totalSpend float64
		var highestAmount, lowestAmount float64
		var highestMonth, lowestMonth string
		first := true

		for _, month := range trend {
			totalSpend += month.Total
			if first || month.Total > highestAmount {
				highestAmount = month.Total
				highestMonth = month.StartDate[:7] // YYYY-MM
			}
			if first || month.Total < lowestAmount {
				lowestAmount = month.Total
				lowestMonth = month.StartDate[:7]
			}
			first = false
		}

		summary.Summary.TotalSpend = totalSpend
		summary.Summary.AverageMonthly = totalSpend / float64(len(trend))
		summary.Summary.HighestMonth = highestMonth
		summary.Summary.HighestAmount = highestAmount
		summary.Summary.LowestMonth = lowestMonth
		summary.Summary.LowestAmount = lowestAmount

		data, _ := json.MarshalIndent(summary, "", "  ")
		return mcp.NewToolResultText(string(data)), nil
	})

	// Tool: Get costs across ALL subscriptions
	s.AddTool(mcp.NewTool("azure_get_all_subscriptions_costs",
		mcp.WithDescription("Get Azure costs for the current month across ALL subscriptions the credential has access to. Returns per-subscription breakdown and aggregated totals."),
	), func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		client, err := NewAzureClient("")
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("Failed to create Azure client: %v", err)), nil
		}

		costs, err := client.GetAllSubscriptionsCurrentMonthCosts(ctx)
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("Failed to get all subscriptions costs: %v", err)), nil
		}

		data, _ := json.MarshalIndent(costs, "", "  ")
		return mcp.NewToolResultText(string(data)), nil
	})

	// Tool: Get cost comparison across ALL subscriptions (current month vs previous month)
	s.AddTool(mcp.NewTool("azure_get_all_subscriptions_cost_comparison",
		mcp.WithDescription("Compare Azure costs between current month and previous month across ALL subscriptions. Returns per-subscription comparison with current/previous costs, difference, and percent change. Uses same day-of-month for fair comparison (e.g., Feb 1-12 vs Jan 1-12)."),
	), func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		client, err := NewAzureClient("")
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("Failed to create Azure client: %v", err)), nil
		}

		comparison, err := client.GetAllSubscriptionsCostComparison(ctx)
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("Failed to get all subscriptions cost comparison: %v", err)), nil
		}

		data, _ := json.MarshalIndent(comparison, "", "  ")
		return mcp.NewToolResultText(string(data)), nil
	})

	// Start the server
	if err := server.ServeStdio(s); err != nil {
		fmt.Fprintf(os.Stderr, "Server error: %v\n", err)
		os.Exit(1)
	}
}
