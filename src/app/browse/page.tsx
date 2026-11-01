import { signOutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

export default function BrowsePage() {
  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Browse listings</h1>
        <form action={signOutAction}>
          <Button type="submit" variant="outline" size="sm">
            Sign out
          </Button>
        </form>
      </div>
    </main>
  );
}
