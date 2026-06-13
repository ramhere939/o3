import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const mockData = [
  { id: '1', name: 'ChemCorp India', gstin: '27AADCB2230M1Z2', role: 'Supplier', date: '2026-06-04' },
  { id: '2', name: 'PowerTech Solutions', gstin: '07BBDCP1234N1Z5', role: 'Buyer', date: '2026-06-03' },
  { id: '3', name: 'Global Chemicals Ltd', gstin: '09XXZYP5678Q1Z9', role: 'Supplier', date: '2026-06-01' },
];

export default function KycQueue() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">KYC Documents</h1>
          <p className="text-muted-foreground text-sm mt-1">View submitted KYC documents from buyers and suppliers.</p>
        </div>
        <Button variant="outline">Export CSV</Button>
      </div>

      <div className="border rounded-md bg-card shadow-sm border-muted">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Company Name</TableHead>
              <TableHead>GSTIN</TableHead>
              <TableHead>User Type</TableHead>
              <TableHead>Submission Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockData.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{row.gstin}</TableCell>
                <TableCell>{row.role}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">View Docs</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
