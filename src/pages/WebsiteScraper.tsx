import { WebsiteScraper } from '@/components/WebsiteScraper';
import DashboardLayout from '@/components/DashboardLayout';

const WebsiteScraperPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">AI Website Scraper</h1>
          <p className="text-muted-foreground mt-2">
            Scrape websites and automatically translate content to multiple languages using AI
          </p>
        </div>
        
        <WebsiteScraper />
      </div>
    </DashboardLayout>
  );
};

export default WebsiteScraperPage;