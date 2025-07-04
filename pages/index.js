import Head from 'next/head';
import MealPlannerApp from '../components/MealPlannerApp';
import { ErrorBoundary } from 'next/dist/client/components/error-boundary';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Meal Planner - 食事計画アプリ</title>
        <meta name="description" content="食材管理とレシピ検索ができる食事計画アプリ" />
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" 
        />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Meal Planner" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      </Head>
      
      <MealPlannerApp />
      <ErrorBoundary>
        <MealPlannerApp />
      </ErrorBoundary>
    </div>
  );
}