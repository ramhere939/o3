import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";

const mockData = [
  { id: '1', name: 'Titanium Dioxide', casNo: '13463-67-7', hsnCode: '28230010', category: 'Pigments', status: 'Active' },
  { id: '2', name: 'Sodium Hydroxide', casNo: '1310-73-2', hsnCode: '28151190', category: 'Caustics', status: 'Active' },
  { id: '3', name: 'Sulfuric Acid', casNo: '7664-93-9', hsnCode: '28070010', category: 'Acids', status: 'Deprecated' },
];

export default function MasterDataQueue() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Master Data Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage global database of chemicals, HSN codes, and standard parameters.</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Add Chemical
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search chemicals or CAS number..." className="pl-8 bg-card" />
        </div>
      </div>

      <div className="border rounded-md bg-card shadow-sm border-muted">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Chemical Name</TableHead>
              <TableHead>CAS Number</TableHead>
              <TableHead>HSN Code</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockData.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{row.casNo}</TableCell>
                <TableCell>{row.hsnCode}</TableCell>
                <TableCell>{row.category}</TableCell>
                <TableCell>
                  <Badge variant={row.status === 'Active' ? 'default' : 'secondary'}>
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
