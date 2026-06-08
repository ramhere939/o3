import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const mockData = [
  { id: 'D-1029', buyer: 'PowerTech Solutions', supplier: 'ChemCorp India', reason: 'Delayed Delivery', amount: '₹1,50,000', status: 'Open', date: '2026-06-03' },
  { id: 'D-1030', buyer: 'Global Enterprises', supplier: 'Delta Chemicals', reason: 'Quality Issue', amount: '₹85,000', status: 'In Review', date: '2026-06-02' },
  { id: 'D-1031', buyer: 'Innovate Mfg', supplier: 'Alpha Suppliers', reason: 'Payment Dispute', amount: '₹2,10,000', status: 'Resolved', date: '2026-05-30' },
];

export default function DisputeQueue() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dispute Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Review and resolve buyer-supplier disputes.</p>
        </div>
        <Button variant="outline">Export Report</Button>
      </div>

      <div className="border rounded-md bg-card shadow-sm border-muted">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Dispute ID</TableHead>
              <TableHead>Buyer / Supplier</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Disputed Amount</TableHead>
              <TableHead>Date Filed</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockData.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium text-primary">{row.id}</TableCell>
                <TableCell>
                  <div className="text-sm font-medium">{row.buyer}</div>
                  <div className="text-xs text-muted-foreground">vs {row.supplier}</div>
                </TableCell>
                <TableCell>{row.reason}</TableCell>
                <TableCell>{row.amount}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>
                  <Badge 
                    variant={row.status === 'Resolved' ? 'default' : 'secondary'} 
                    className={
                      row.status === 'Open' ? 'bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20' : 
                      row.status === 'In Review' ? 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-500/20' : ''
                    }
                  >
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">View details</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
