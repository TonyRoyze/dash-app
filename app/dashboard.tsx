"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CustomBarChart } from "../components/charts/bar-chart"
import { CustomLineChart } from "../components/charts/line-chart"
// import { CustomPieChart } from "../components/charts/pie-chart"
import { parseCSV, aggregateByRegion, aggregateByProduct, getMonthlyTrends, type SalesRecord } from "../lib/data-utils"
import { DollarSign, TrendingUp, Package, Users, AlertCircle, ChevronDown, X, BarChart3, Filter } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { sampleData } from "../lib/sample-data"
import { ChartPieInteractive } from "@/components/charts/interactive-pie-chart"
import { ThemeToggle } from "@/components/theme-toggle"
import { Slider } from "@/components/ui/slider"

export default function AdidasSalesDashboard() {
  const [data, setData] = useState<SalesRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log("Fetching CSV data...")
      const response = await fetch("/adidas-sales.csv")

      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`)
      }

      const csvText = await response.text()
      console.log("CSV data received, length:", csvText.length)
      console.log("First 100 characters:", csvText.substring(0, 100))

      if (!csvText || csvText.trim() === "") {
        throw new Error("CSV file is empty")
      }

      const parsedData = parseCSV(csvText)
      console.log(`Parsed ${parsedData.length} records from CSV`)

      if (parsedData.length === 0) {
        console.warn("No data parsed from CSV, using sample data")
        setData(sampleData)
      } else {
        setData(parsedData)
      }
    } catch (err) {
      console.error("Error loading data:", err)
      console.warn("Using sample data as fallback")
      setData(sampleData)
      setError(`${err instanceof Error ? err.message : "Failed to load data"} (using sample data as fallback)`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // If there's an error, show an error message with retry button
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading data</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">{error}</p>
            <Button onClick={loadData}>Retry</Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading Adidas Sales Data...</p>
        </div>
      </div>
    )
  }

  // If we have no data even after loading, show a message
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No data available</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">No sales data could be loaded. Please check the data source.</p>
            <Button onClick={loadData}>Retry</Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Filter data based on selections
  const filteredData = data.filter((record) => {
    const regionMatch = selectedRegions.length === 0 || selectedRegions.includes(record.Region)
    const productMatch = selectedProducts.length === 0 || selectedProducts.includes(record.Product)
    return regionMatch && productMatch
  })

  // Calculate summary statistics
  const totalSales = filteredData.reduce((sum, record) => sum + record["Total Sales"], 0)
  const totalProfit = filteredData.reduce((sum, record) => sum + record["Operating Profit"], 0)
  const totalUnits = filteredData.reduce((sum, record) => sum + record["Units Sold"], 0)
  const avgMargin = totalProfit / totalSales || 0
  const uniqueRetailers = new Set(filteredData.map((record) => record.Retailer)).size

  // Aggregate data for charts
  const regionData = aggregateByRegion(filteredData)
  const productData = aggregateByProduct(filteredData).slice(0, 10) // Top 10 products
  const monthlyTrends = getMonthlyTrends(filteredData)

  // Sales method distribution
  const salesMethodData = filteredData.reduce(
    (acc, record) => {
      acc[record["Sales Method"]] = (acc[record["Sales Method"]] || 0) + record["Total Sales"]
      return acc
    },
    {} as Record<string, number>,
  )


  const salesMethodChart = Object.entries(salesMethodData).map(([method, sales]) => ({
    method,
    sales,
  }))

  // Top retailers
  const retailerData = filteredData.reduce(
    (acc, record) => {
      if (!acc[record.Retailer]) {
        acc[record.Retailer] = { sales: 0, profit: 0 }
      }
      acc[record.Retailer].sales += record["Total Sales"]
      acc[record.Retailer].profit += record["Operating Profit"]
      return acc
    },
    {} as Record<string, any>,
  )

  const topRetailers = Object.entries(retailerData)
    .map(([retailer, data]) => ({ retailer, ...data }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 10)

  const regions = [...new Set(data.map((record) => record.Region))]
  const products = [...new Set(data.map((record) => record.Product))]

  const handleRegionChange = (region: string, checked: boolean) => {
    if (checked) {
      setSelectedRegions(prev => [...prev, region])
    } else {
      setSelectedRegions(prev => prev.filter(r => r !== region))
    }
  }

  const handleProductChange = (product: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, product])
    } else {
      setSelectedProducts(prev => prev.filter(p => p !== product))
    }
  }

  const clearRegionFilters = () => setSelectedRegions([])
  const clearProductFilters = () => setSelectedProducts([])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header & Branding Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                <svg role="presentation" viewBox="100 100 50 32" xmlns="http://www.w3.org/2000/svg">
                  <title>Homepage</title>
                  <path fillRule="evenodd" clipRule="evenodd" d="M 150.07 131.439 L 131.925 100 L 122.206 105.606 L 137.112 131.439 L 150.07 131.439 Z M 132.781 131.439 L 120.797 110.692 L 111.078 116.298 L 119.823 131.439 L 132.781 131.439 Z M 109.718 121.401 L 115.509 131.439 L 102.551 131.439 L 100 127.007 L 109.718 121.401 Z" className="fill-foreground"></path>
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Adidas US Sales Analytics
                </h1>
                <p className="text-muted-foreground">Sales performance dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Section Divider */}
        <div className="border-t-2 border-dashed border-border my-8"></div>

        {/* Filters Section */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-card-foreground">Data Filters</h2>
          </div>

          <div className="flex gap-4 mb-4">
            {/* Region Multi-Select */}
            <div className="w-64">
              <label className="block text-sm font-medium text-card-foreground mb-2">Regions</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span>
                      {selectedRegions.length === 0
                        ? "Select Regions"
                        : selectedRegions.length === 1
                          ? selectedRegions[0]
                          : `${selectedRegions.length} regions selected`}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-5">
                      <h4 className="font-medium">Regions</h4>
                      <Button variant="destructive" size="sm" onClick={clearRegionFilters}>
                        Clear
                      </Button>
                    </div>
                    <div className="space-y-4 max-h-48 overflow-y-auto">
                      {regions.map((region) => (
                        <div key={region} className="flex items-center space-x-3">
                          <Checkbox
                            id={`region-${region}`}
                            checked={selectedRegions.includes(region)}
                            onCheckedChange={(checked) => handleRegionChange(region, checked as boolean)}
                          />
                          <label
                            htmlFor={`region-${region}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {region}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Product Multi-Select */}
            <div className="w-64">
              <label className="block text-sm font-medium text-card-foreground mb-2">Products</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span>
                      {selectedProducts.length === 0
                        ? "Select Products"
                        : selectedProducts.length === 1
                          ? selectedProducts[0]
                          : `${selectedProducts.length} products selected`}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-5">
                      <h4 className="font-medium">Products</h4>
                      <Button variant="destructive" size="sm" onClick={clearProductFilters}>
                        Clear
                      </Button>
                    </div>
                    <div className="space-y-4 max-h-48 overflow-y-auto">
                      {products.map((product) => (
                        <div key={product} className="flex items-center space-x-3">
                          <Checkbox
                            id={`product-${product}`}
                            checked={selectedProducts.includes(product)}
                            onCheckedChange={(checked) => handleProductChange(product, checked as boolean)}
                          />
                          <label
                            htmlFor={`product-${product}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {product}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            {/* Time Slider */}
            <div className="w-64">
              <label className="block text-sm font-medium text-card-foreground mb-2">Period</label>
              <Slider />
            </div>
          </div>



          {/* Selected Filters Display */}
          {(selectedRegions.length > 0 || selectedProducts.length > 0) && (
            <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <h4 className="text-sm font-medium text-primary mb-2">Active Filters:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedRegions.map((region) => (
                  <Badge key={`region-${region}`} variant="outline" className="flex items-center gap-1 p-3 bg-background">
                    Region: {region}
                    <X
                      className="h-4 w-4 cursor-pointer hover:text-destructive"
                      onClick={() => handleRegionChange(region, false)}
                    />
                  </Badge>
                ))}
                {selectedProducts.map((product) => (
                  <Badge key={`product-${product}`} variant="outline" className="flex items-center gap-1 p-3 bg-background">
                    Product: {product}
                    <X
                      className="h-4 w-4 cursor-pointer hover:text-destructive"
                      onClick={() => handleProductChange(product, false)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section Divider */}
        <div className="border-t-2 border-dashed border-border my-8"></div>

        {/* Key Metrics Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Key Performance Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalSales.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Across {filteredData.length} transactions</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Operating Profit</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalProfit.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{(avgMargin * 100).toFixed(1)}% margin</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Units Sold</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUnits.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Avg: {filteredData.length ? Math.round(totalUnits / filteredData.length) : 0} per transaction
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Retailers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{uniqueRetailers}</div>
                <p className="text-xs text-muted-foreground">Unique retail partners</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Section Divider */}
        <div className="border-t-2 border-dashed border-border my-8"></div>

        {/* Analytics Section */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Detailed Analytics
          </h2>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="regional">Regional Analysis</TabsTrigger>
              <TabsTrigger value="products">Product Performance</TabsTrigger>
              <TabsTrigger value="trends">Time Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>Sales by Method</CardTitle>
                    <CardDescription>Distribution of sales across different channels</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartPieInteractive data={salesMethodChart} dataKey="sales" nameKey="method" />
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>Top Retailers by Sales</CardTitle>
                    <CardDescription>Best performing retail partners</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CustomBarChart data={topRetailers} xKey="retailer" yKey="sales" />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="regional" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>Sales by Region</CardTitle>
                    <CardDescription>Regional performance comparison</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CustomBarChart data={regionData} xKey="region" yKey="totalSales" />
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>Profit by Region</CardTitle>
                    <CardDescription>Regional profitability analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CustomBarChart data={regionData} xKey="region" yKey="totalProfit" />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="products">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>Sales by Product</CardTitle>
                    <CardDescription>Best selling product categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CustomBarChart data={productData} xKey="product" yKey="totalSales" />
                  </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle>Profit by Product</CardTitle>
                    <CardDescription>Product profitability analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CustomBarChart data={productData} xKey="product" yKey="totalProfit" />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>Monthly Sales Trends</CardTitle>
                  <CardDescription>Sales and profit trends over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <CustomLineChart
                    data={monthlyTrends}
                    xKey="month"
                    yKeys={["totalSales", "totalProfit"]}
                    colors={["#c4a2d5", "#613576"]}
                  />
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>Monthly Units Sold</CardTitle>
                  <CardDescription>Volume trends over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <CustomLineChart data={monthlyTrends} xKey="month" yKeys={["unitsSold"]} colors={["#c4a2d5"]} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div >
  )
}
