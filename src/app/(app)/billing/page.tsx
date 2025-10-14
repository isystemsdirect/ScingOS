import { Check, CreditCard, Download, PlusCircle } from "lucide-react"
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

export default function BillingPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold">Subscriptions & Billing</h1>
        <p className="text-muted-foreground">
          Manage your plan, payment methods, and view billing history.
        </p>
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

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
            <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Manage your saved credit and debit cards.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="border rounded-lg p-4 flex items-center">
                    <CreditCard className="h-6 w-6 mr-4" />
                    <div className="flex-1">
                        <p className="font-medium">Visa ending in 1234</p>
                        <p className="text-sm text-muted-foreground">Expires 08/2026</p>
                    </div>
                    <Button variant="ghost" size="sm">Remove</Button>
                </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Payment Method</Button>
            </CardFooter>
        </Card>
        <Card>
            <CardHeader>
            <CardTitle>Billing History</CardTitle>
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

    </div>
  )
}
