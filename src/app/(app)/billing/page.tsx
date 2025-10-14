import { Check } from "lucide-react"
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

export default function BillingPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Subscriptions & Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription plan and view billing history.
        </p>
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View and download your past invoices.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">No invoices to display yet.</p>
        </CardContent>
      </Card>
    </div>
  )
}
