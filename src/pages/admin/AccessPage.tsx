import * as React from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Shield, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  listAllProfiles,
  setUserRole,
  updateMyName,
} from '@/lib/data/access';
import { listLeagues } from '@/lib/data/leagues';
import { useAuth } from '@/lib/auth';
import { errorMessage } from '@/lib/utils';
import type { UserRole } from '@/types/db';

export function AccessPage() {
  const { user, profile, isSuperadmin, managedLeagueIds, refreshAccess } = useAuth();
  const qc = useQueryClient();

  const { data: leagues = [] } = useQuery({
    queryKey: ['leagues'],
    queryFn: listLeagues,
  });
  const myLeagues = leagues.filter((l) => managedLeagueIds.has(l.id));

  const [name, setName] = React.useState(profile?.full_name ?? '');
  React.useEffect(() => {
    setName(profile?.full_name ?? '');
  }, [profile?.full_name]);

  const saveName = useMutation({
    mutationFn: (n: string) => updateMyName(n),
    onSuccess: async () => {
      toast.success('Name updated');
      await refreshAccess();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My access</h1>
        <p className="text-sm text-muted-foreground">
          Your role determines what you can manage in BowlTrack.
        </p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-lg">Profile</CardTitle>
          <Badge variant={isSuperadmin ? 'default' : 'secondary'}>
            {isSuperadmin ? (
              <>
                <ShieldCheck className="h-3 w-3 mr-1" /> Superadmin
              </>
            ) : (
              <>
                <Shield className="h-3 w-3 mr-1" /> Organizer
              </>
            )}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Signed in as <span className="font-medium text-foreground">{user?.email}</span>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveName.mutate(name);
            }}
            className="flex items-end gap-2 flex-wrap max-w-md"
          >
            <div className="space-y-1 flex-1">
              <Label htmlFor="name">Display name</Label>
              <Input
                id="name"
                placeholder="How other admins see you"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={saveName.isPending || name === (profile?.full_name ?? '')}>
              Save
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Leagues you manage</CardTitle>
          <p className="text-xs text-muted-foreground">
            {isSuperadmin
              ? 'You are a superadmin — you can manage every league. The list below shows leagues you were explicitly granted as well.'
              : 'You can only see and edit leagues, members, and events for the leagues below.'}
          </p>
        </CardHeader>
        <CardContent>
          {myLeagues.length === 0 && !isSuperadmin ? (
            <p className="text-sm text-muted-foreground">
              You have no league access yet. A superadmin or existing league
              admin needs to grant you on the league's <strong>Admins</strong>{' '}
              tab.
            </p>
          ) : (
            <ul className="space-y-1 text-sm">
              {(isSuperadmin ? leagues : myLeagues).map((l) => (
                <li key={l.id}>
                  <Link
                    to={`/admin/leagues/${l.id}`}
                    className="hover:underline"
                  >
                    {l.name}
                    {l.acronym ? (
                      <span className="text-muted-foreground"> ({l.acronym})</span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {isSuperadmin && <AllOrganizersCard onChanged={() => qc.invalidateQueries()} />}
    </div>
  );
}

function AllOrganizersCard({ onChanged }: { onChanged: () => void }) {
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['all-profiles'],
    queryFn: listAllProfiles,
  });

  const promote = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      setUserRole(userId, role),
    onSuccess: () => {
      toast.success('Role updated');
      onChanged();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">All organizers</CardTitle>
        <p className="text-xs text-muted-foreground">
          Visible to superadmins only. Promote / demote roles here. To grant
          per-league access, use the league's Admins tab.
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-24" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="w-44">Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((p) => (
                <TableRow key={p.user_id}>
                  <TableCell className="font-medium">
                    {p.full_name || (
                      <span className="text-muted-foreground">
                        {p.user_id.slice(0, 8)}…
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={p.role}
                      onValueChange={(v) =>
                        promote.mutate({ userId: p.user_id, role: v as UserRole })
                      }
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="organizer">Organizer</SelectItem>
                        <SelectItem value="superadmin">Superadmin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
