import { useNavigate } from "react-router-dom";
import { Ghost, Home } from "lucide-react";
import { Page } from "../components/layout/index.js";
import { Button, Card, EmptyState } from "../components/ui/index.js";

export function NotFound() {
  const navigate = useNavigate();
  return (
    <Page>
      <h1 className="sr-only">Page Not Found</h1>
      <Card className="mx-auto mt-8 max-w-lg sm:mt-16">
        <EmptyState
          icon={Ghost}
          title="Room or Page Not Found"
          description="The location you requested does not exist, has moved, or the URL is incorrect."
          action={
            <Button leftIcon={<Home className="size-4" />} onClick={() => navigate("/")}>
              Return to Dashboard
            </Button>
          }
        />
      </Card>
    </Page>
  );
}
