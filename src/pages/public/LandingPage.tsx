import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function LandingPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 space-y-8">
      <div className="text-center space-y-3">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Trophy className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">BowlTrack</h1>
        <p className="text-muted-foreground">
          Real-time 10-pin scoring for leagues and tournaments. Enter scores on any
          device, share a link, and watch the leaderboard update live.
        </p>
        <div className="flex justify-center gap-2 pt-2">
          <Button asChild>
            <Link to="/login">Organizer sign in</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="py-6 space-y-2 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">Have a link?</strong> Paste it in
            your browser or follow the QR code from your organizer.
          </p>
          <p>
            Event leaderboards live at{' '}
            <code className="text-foreground">/e/&lt;slug&gt;</code>. League
            profiles live at{' '}
            <code className="text-foreground">/leagues/&lt;slug&gt;</code>. No
            login required to view either.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
