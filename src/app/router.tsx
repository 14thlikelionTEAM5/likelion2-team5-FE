import { createBrowserRouter } from 'react-router';
import AuthLayout from '@/layouts/AuthLayout';
import AppLayout from '@/layouts/AppLayout';
import LandingPage from '@/features/auth/pages/LandingPage';
import LoginPage from '@/features/auth/pages/LoginPage';
import SignupPage from '@/features/auth/pages/SignupPage';
import HomePage from '@/features/home/pages/HomePage';
import SchoolListPage from '@/features/schools/pages/SchoolListPage';
import SchoolDetailPage from '@/features/schools/pages/SchoolDetailPage';
import ExperienceNewPage from '@/features/experience/pages/ExperienceNewPage';
import ExperienceMinePage from '@/features/experience/pages/ExperienceMinePage';
import ExperienceEditPage from '@/features/experience/pages/ExperienceEditPage';
import FavoritesPage from '@/features/favorites/pages/FavoritesPage';
import PlanListPage from '@/features/plans/pages/PlanListPage';
import PlanEditPage from '@/features/plans/pages/PlanEditPage';
import MyPage from '@/features/mypage/pages/MyPage';
import NotFoundPage from '@/app/NotFoundPage';

export const router = createBrowserRouter([
  {
    Component: AuthLayout,
    children: [
      { path: '/', Component: LandingPage },
      { path: '/login', Component: LoginPage },
      { path: '/signup', Component: SignupPage },
    ],
  },
  {
    Component: AppLayout,
    children: [
      { path: '/home', Component: HomePage },
      { path: '/schools', Component: SchoolListPage },
      { path: '/schools/favorites', Component: FavoritesPage },
      { path: '/schools/:universityId', Component: SchoolDetailPage },
      { path: '/experience/new', Component: ExperienceNewPage },
      { path: '/experience/mine', Component: ExperienceMinePage },
      { path: '/experience/edit/:kind/:id', Component: ExperienceEditPage },
      { path: '/plans', Component: PlanListPage },
      { path: '/plans/:planId/edit', Component: PlanEditPage },
      { path: '/mypage', Component: MyPage },
    ],
  },
  { path: '*', Component: NotFoundPage },
]);
