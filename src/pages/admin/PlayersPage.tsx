import { useQuery } from '@tanstack/react-query';
import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { listPlayers } from '@/lib/data/players';

export function PlayersPage() {
  const { data = [], isLoading } = useQuery({ queryKey: ['players'], queryFn: listPlayers });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Players</h1>
        <p className="text-sm text-muted-foreground">
          Everyone you've registered across events.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All players ({data.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8" />
              <Skeleton className="h-8" />
              <Skeleton className="h-8" />
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <Users className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="font-medium">No players yet.</p>
              <p className="text-sm text-muted-foreground">
                Add players from the event roster page.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Handedness</TableHead>
                  <TableHead>Home avg</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.full_name}</TableCell>
                    <TableCell className="capitalize">{p.handedness ?? '—'}</TableCell>
                    <TableCell>{p.home_average ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
