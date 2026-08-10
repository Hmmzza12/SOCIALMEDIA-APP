import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import RecentPostsSidebar from './RecentPostsSidebar';
import GlobalHeader from './GlobalHeader';
import MobileTabBar from './MobileTabBar';

export default function Layout() {
    return (
        <div className="min-h-screen bg-base text-content-primary">
            <GlobalHeader />

            <Sidebar />

            <main className="pt-[52px] ml-0 mr-0 md:ml-[240px] xl:mr-[300px] min-h-screen">
                <div className="max-w-[680px] mx-auto px-4 sm:px-8 py-6">
                    <Outlet />
                </div>
            </main>

            <RecentPostsSidebar />

            <MobileTabBar />
        </div>
    );
}
