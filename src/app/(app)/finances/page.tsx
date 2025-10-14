
import { Check, CreditCard, Download, PlusCircle, DollarSign, ClipboardCheck, University, Mail } from "lucide-react"
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

const mockInvoices = [
    { id: 'INV-2024-001', date: '2024-07-15', amount: '$199.00', status: 'Paid' },
    { id: 'INV-2024-002', date: '2024-06-15', amount: '$199.00', status: 'Paid' },
    { id: 'INV-2024-003', date: '2024-05-15', amount: '$29.00', status: 'Paid' },
]

export default function FinancesPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">Finances</h1>
        <p className="text-muted-foreground">
          Manage your plan, payment methods, and view your transaction history.
        </p>
      </div>

       <div className="grid gap-4 md:grid-cols-2 md:gap-8">
        <Card>
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
        <Card>
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

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
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
                    <University className="h-6 w-6 mr-4 text-primary" />
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
                    <svg role="img" viewBox="0 0 24 24" className="mr-4 h-6 w-6 text-muted-foreground fill-current"><path d="M7.963 21.228a.545.545 0 0 1-.53-.728l1.01-3.323-6.42-1.92a.545.545 0 0 1-.163-.956l17.728-7.23a.545.545 0 0 1 .68.61L12.04 18.064l-3.328 3.018a.546.546 0 0 1-.75.145zm.609-4.332a.545.545 0 0 1 .455.1l3.018 2.735 6.88-12.05-15.022 6.126 4.67 1.4zM5.564 12.01a.545.545 0 0 1 .374-.937L9.9 9.32a.546.546 0 0 0 .373-.938L6.31 6.627a.545.545 0 0 1-.163-.956l10.49-4.278a.545.545 0 0 1 .68.61L9.18 13.398a.545.545 0 0 1-.95.378l-2.42-2.193a.545.545 0 0 1-.247-.573z"/></svg>
                    <div className="flex-1">
                        <p className="font-medium">PayPal</p>
                        <p className="text-sm text-muted-foreground">Accept payments via PayPal.</p>
                    </div>
                    <Button variant="secondary" size="sm">Enable</Button>
                </div>
                <div className="border rounded-lg p-4 flex items-center bg-muted/50">
                    <svg role="img" viewBox="0 0 24 24" className="mr-4 h-6 w-6 text-muted-foreground fill-current"><path d="M12.152 6.896c-.922 0-1.554.63-1.554 1.514c0 .905.65 1.513 1.572 1.513c.921 0 1.553-.608 1.553-1.513c0-.884-.632-1.514-1.57-1.514m2.02.018c.884 0 1.483.509 1.483 1.258c0 .767-.582 1.259-1.465 1.259c.865 0 1.448.509 1.448 1.276c0 .768-.582 1.277-1.483 1.277c-.904 0-1.482-.509-1.482-1.277c0-.767.578-1.276 1.482-1.276c-.865 0-1.447-.509-1.447-1.259c0-.749.58-1.258 1.465-1.258M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12s12-5.373 12-12S18.627 0 12 0m6.566 18.363c-.12.18-.24.355-.387.513c-.148.158-.309.305-.479.435c-.17.13-.358.24-.552.33c-.193.09-.404.135-.62.135c-.347 0-.67-.09-1.01-.278c-.34-.189-.621-.45-.841-.784c-.22-.334-.33-.714-.33-1.148c0-.492.14-1.02.42-1.582c.28-.562.674-1.12.992-1.498c.32-.378.562-.68.728-.906c.166-.225.25-.485.25-.783c0-.312-.08-.57-.24-.774c-.16-.204-.39-.306-.69-.306c-.262 0-.485.064-.67.19c-.185.128-.32.32-.404.578l-1.534-.93c.333-.56.784-1.01 1.352-1.348c.568-.337 1.23-.506 1.98-.506c.715 0 1.33.159 1.844.478c.513.318.77.788.77 1.41c0 .435-.114.83-.343 1.185c-.23.355-.54.735-.93 1.14c-.39.405-.71.82-.96 1.244c-.25.425-.375.92-.375 1.488c0 .484.093.88.28 1.184c.188.305.45.54.782.706c.334.167.72.25 1.156.25c.25 0 .482-.03.69-.09c.21-.06.393-.144.552-.25c.16-.107.29-.23.404-.37c.114-.14.21-.3.288-.475l-1.15-.745Z"/></svg>
                    <div className="flex-1">
                        <p className="font-medium">Apple Pay</p>
                        <p className="text-sm text-muted-foreground">Enable quick payments with Apple Pay.</p>
                    </div>
                    <Button variant="secondary" size="sm">Enable</Button>
                </div>
                <div className="border rounded-lg p-4 flex items-center bg-muted/50">
                    <svg role="img" viewBox="0 0 24 24" className="mr-4 h-6 w-6 text-muted-foreground fill-current"><path d="M12.0003 4.75C13.7703 4.75 15.3553 5.431 16.6053 6.545L19.5633 3.587C17.5883 1.738 15.0253 0.75 12.0003 0.75C7.3003 0.75 3.3253 3.654 1.5563 7.594L4.9963 10.023C5.7953 7.643 8.6203 5.75 12.0003 5.75V4.75Z"/><path d="M23.25 12C23.25 11.231 23.181 10.481 23.056 9.75H12V14.25H18.441C18.181 15.759 17.344 17.062 16.094 17.913L19.494 20.342C21.844 18.263 23.25 15.394 23.25 12Z"/><path d="M12.0003 23.25C15.0253 23.25 17.5883 22.262 19.5633 20.342L16.0943 17.913C15.0763 18.6 13.6253 19.25 12.0003 19.25C8.6203 19.25 5.7953 17.357 4.9963 14.977L1.5563 17.406C3.3253 21.346 7.3003 24.25 12.0003 24.25V23.25Z"/></svg>
                    <div className="flex-1">
                        <p className="font-medium">Google Wallet</p>
                        <p className="text-sm text-muted-foreground">Accept payments through Google Wallet.</p>
                    </div>
                    <Button variant="secondary" size="sm">Enable</Button>
                </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Payment Method</Button>
            </CardFooter>
        </Card>
        <Card>
            <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>View and download your past invoices.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Invoice</TableHead>
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
                                <TableCell>{invoice.date}</TableCell>
                                <TableCell>{invoice.amount}</TableCell>
                                <TableCell><Badge variant={invoice.status === 'Paid' ? 'default' : 'secondary'}>{invoice.status}</Badge></TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Download</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Subscription Plan</CardTitle>
            <CardDescription>You are currently on the Pro plan.</CardDescription>
        </CardHeader>
        <CardContent>
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {mockSubscriptionPlans.map((plan) => (
                <Card key={plan.name} className={cn("flex flex-col", plan.isCurrent && "border-primary ring-2 ring-primary")}>
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
                        <li key={feature} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            {feature}
                        </li>
                        ))}
                    </ul>
                    </CardContent>
                    <CardFooter>
                    <Button
                        className="w-full"
                        disabled={plan.isCurrent}
                        variant={plan.isCurrent ? "outline" : "default"}
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
  )
}
