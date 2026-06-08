import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const mockData = [
  { id: '1', product: 'Titanium Dioxide', supplier: 'ChemCorp India', hsn: '28230010', date: '2026-06-04', status: 'Pending' },
  { id: '2', product: 'Sodium Hydroxide', supplier: 'Global Chemicals Ltd', hsn: '28151190', date: '2026-06-03', status: 'Approved' },
];

export default function CatalogQueue() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catalog Moderation</h1>
          <p className="text-muted-foreground text-sm mt-1">Review new product listings submitted by suppliers.</p>
        </div>
        <Button variant="outline">Bulk Approve</Button>
      </div>

      <div className="border rounded-md bg-card shadow-sm border-muted">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Product Name</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>HSN Code</TableHead>
              <TableHead>Submission Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockData.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.product}</TableCell>
                <TableCell>{row.supplier}</TableCell>
                <TableCell>{row.hsn}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>
                  <Badge variant={row.status === 'Approved' ? 'default' : 'secondary'} className={row.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-500/20' : ''}>
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">Review</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
