
import { Check, CreditCard, Download, PlusCircle, DollarSign, ClipboardCheck, University, Mail, Apple, Landmark, Globe, BarChart2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { mockSubscriptionPlans } from "@/lib/data"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


const mockInvoices = [
    { id: 'INV-2024-001', date: '2024-07-15', amount: '$149.00', status: 'Paid', client: 'Stark Industries' },
    { id: 'INV-2024-002', date: '2024-06-15', amount: '$149.00', status: 'Paid', client: 'Stark Industries' },
    { id: 'INV-2024-003', date: '2024-05-15', amount: '$49.00', status: 'Paid', client: 'Wayne Enterprises' },
    { id: 'INV-2024-004', date: '2024-07-20', amount: '$2,500.00', status: 'Sent', client: 'Cyberdyne Systems', due: '2024-08-19' },
    { id: 'INV-2024-005', date: '2024-04-10', amount: '$1,200.00', status: 'Overdue', client: 'Wayne Enterprises', due: '2024-05-10' },
]

const arAgingData = [
    { client: 'Cyberdyne Systems', invoice: 'INV-2024-004', '0-30': '$2,500.00', '31-60': '', '61-90': '', '90+': '' },
    { client: 'Wayne Enterprises', invoice: 'INV-2024-005', '0-30': '', '31-60': '', '61-90': '$1,200.00', '90+': '' },
    { client: 'Stark Industries', invoice: 'Various', '0-30': '', '31-60': '', '61-90': '', '90+': '$5,500.00' },
];


export default function FinancesPage() {
  const currentPlan = mockSubscriptionPlans.find(p => p.isCurrent) || mockSubscriptionPlans[1];
  return (
    <div className="mx-auto w-full max-w-7xl px-4 lg:px-6">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold">Financial Hub</h1>
          <p className="text-muted-foreground">
            Manage your subscription, billing, transactions, and financial reporting.
          </p>
        </div>

        <Tabs defaultValue="dashboard">
          <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard"><BarChart2 className="mr-2 h-4 w-4"/> Dashboard</TabsTrigger>
              <TabsTrigger value="transactions"><DollarSign className="mr-2 h-4 w-4"/> Transactions</TabsTrigger>
              <TabsTrigger value="reporting"><ClipboardCheck className="mr-2 h-4 w-4"/> Reporting</TabsTrigger>
              <TabsTrigger value="billing"><CreditCard className="mr-2 h-4 w-4"/> Billing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
             <div className="space-y-8">
                <div className="grid gap-4 md:grid-cols-2 md:gap-8">
                <Card className="bg-card/60 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">$45,231.89</div>
                    <p className="text-xs text-muted-foreground">
                        +20.1% from last month
                    </p>
                    </CardContent>
                </Card>
                <Card className="bg-card/60 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Completed Inspections
                    </CardTitle>
                    <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">+2350</div>
                    <p className="text-xs text-muted-foreground">
                        +180.1% from last month
                    </p>
                    </CardContent>
                </Card>
                </div>
                
                <Card className="bg-card/60 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Subscription Plan</CardTitle>
                    <CardDescription>You are currently on the <span className="font-bold text-pro">{currentPlan.name}</span> plan.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {mockSubscriptionPlans.map((plan) => (
                        <Card key={plan.name} className={cn("flex flex-col bg-card/60 backdrop-blur-sm", plan.isCurrent && "border-primary ring-2 ring-primary")}>
                            <CardHeader>
                            <CardTitle>{plan.name}</CardTitle>
                            <CardDescription>
                                <span className="text-3xl font-bold">{plan.price}</span>
                                <span className="text-muted-foreground">{plan.pricePeriod}</span>
                            </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 grid gap-4">
                            <ul className="grid gap-2 text-sm text-muted-foreground">
                                {plan.features.map((feature) => (
                                <li key={feature} className="flex items-start gap-2">
                                    <Check className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                                    <span>{feature}</span>
                                </li>
                                ))}
                            </ul>
                            </CardContent>
                            <CardFooter>
                            <Button
                                className="w-full"
                                disabled={plan.isCurrent}
                                variant={plan.name.includes('Enterprise') ? 'pro' : plan.isCurrent ? 'outline' : 'default'}
                            >
                                {plan.cta}
                            </Button>
                            </CardFooter>
                        </Card>
                        ))}
                    </div>
                </CardContent>
                </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions">
              <Card className="bg-card/60 backdrop-blur-sm">
                <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>View and download your past invoices.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Invoice</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockInvoices.map(invoice => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-medium">{invoice.id}</TableCell>
                                    <TableCell>{invoice.client}</TableCell>
                                    <TableCell>{invoice.date}</TableCell>
                                    <TableCell>{invoice.amount}</TableCell>
                                    <TableCell><Badge variant={invoice.status === 'Paid' ? 'default' : (invoice.status === 'Overdue' ? 'destructive' : 'secondary')}>{invoice.status}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Download</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reporting">
             <Card className="bg-card/60 backdrop-blur-sm">
                <CardHeader>
                <CardTitle>Accounts Receivable Aging</CardTitle>
                <CardDescription>An overview of outstanding invoices from clients.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Client</TableHead>
                            <TableHead>Invoice #</TableHead>
                            <TableHead>0-30 Days</TableHead>
                            <TableHead>31-60 Days</TableHead>
                            <TableHead>61-90 Days</TableHead>
                            <TableHead>90+ Days</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {arAgingData.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{row.client}</TableCell>
                                    <TableCell>{row.invoice}</TableCell>
                                    <TableCell>{row['0-30']}</TableCell>
                                    <TableCell>{row['31-60']}</TableCell>
                                    <TableCell>{row['61-90']}</TableCell>
                                    <TableCell>{row['90+']}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <Card className="bg-card/60 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Manage your saved payment methods for invoicing.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="border rounded-lg p-4 flex items-center">
                        <CreditCard className="h-6 w-6 mr-4 text-primary" />
                        <div className="flex-1">
                            <p className="font-medium">Visa ending in 1234</p>
                            <p className="text-sm text-muted-foreground">Expires 08/2026</p>
                        </div>
                        <Button variant="ghost" size="sm">Remove</Button>
                    </div>
                    <div className="border rounded-lg p-4 flex items-center">
                        <Landmark className="h-6 w-6 mr-4 text-primary" />
                        <div className="flex-1">
                            <p className="font-medium">Chase Bank (ACH)</p>
                            <p className="text-sm text-muted-foreground">Checking account ending in 5678</p>
                        </div>
                        <Button variant="ghost" size="sm">Remove</Button>
                    </div>
                    <div className="border rounded-lg p-4 flex items-center bg-muted/50">
                        <Mail className="h-6 w-6 mr-4 text-muted-foreground" />
                        <div className="flex-1">
                            <p className="font-medium">Mail-in Check</p>
                            <p className="text-sm text-muted-foreground">Allow clients to pay by physical check.</p>
                        </div>
                        <Button variant="secondary" size="sm">Enable</Button>
                    </div>
                    <div className="border rounded-lg p-4 flex items-center bg-muted/50">
                        <Globe className="mr-4 h-6 w-6 text-muted-foreground" />
                        <div className="flex-1">
                            <p className="font-medium">PayPal</p>
                            <p className="text-sm text-muted-foreground">Accept payments via PayPal.</p>
                        </div>
                        <Button variant="secondary" size="sm">Enable</Button>
                    </div>
                    <div className="border rounded-lg p-4 flex items-center bg-muted/50">
                        <Apple className="mr-4 h-6 w-6 text-muted-foreground fill-current"/>
                        <div className="flex-1">
                            <p className="font-medium">Apple Pay</p>
                            <p className="text-sm text-muted-foreground">Enable quick payments with Apple Pay.</p>
                        </div>
                        <Button variant="secondary" size="sm">Enable</Button>
                    </div>
                    <div className="border rounded-lg p-4 flex items-center bg-muted/50">
                        <Globe className="mr-4 h-6 w-6 text-muted-foreground" />
                        <div className="flex-1">
                            <p className="font-medium">Google Pay</p>
                            <p className="text-sm text-muted-foreground">Accept payments through Google Pay.</p>
                        </div>
                        <Button variant="secondary" size="sm">Enable</Button>
                    </div>
                </CardContent>
                <CardFooter className="border-t pt-6">
                    <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Payment Method</Button>
                </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
