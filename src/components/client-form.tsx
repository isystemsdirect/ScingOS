
'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export function ClientForm() {
  return (
    <div className="grid gap-6 pt-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="grid gap-3">
          <Label htmlFor="client-name">Full Name or Company</Label>
          <Input id="client-name" placeholder="Stark Industries" />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="client-email">Email Address</Label>
          <Input id="client-email" type="email" placeholder="tony@stark.com" />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-3">
            <Label htmlFor="client-phone">Phone Number</Label>
            <Input id="client-phone" type="tel" placeholder="(212) 555-0100" />
          </div>
      </div>
       <div className="grid gap-3">
          <Label htmlFor="client-street">Mailing Address (Optional)</Label>
          <Input id="client-street" placeholder="10880 Malibu Point" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="grid gap-3">
              <Label htmlFor="client-city">City</Label>
              <Input id="client-city" placeholder="Malibu" />
          </div>
          <div className="grid gap-3">
              <Label htmlFor="client-state">State / Province</Label>
              <Input id="client-state" placeholder="CA" />
          </div>
          <div className="grid gap-3">
              <Label htmlFor="client-zip">ZIP / Postal Code</Label>
              <Input id="client-zip" placeholder="90265" />
          </div>
      </div>
    </div>
  );
}
