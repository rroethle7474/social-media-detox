import { Routes } from '@angular/router';
import { TopicComponent } from './components/topic/topic.component';
import { AddTopicComponent } from './components/add-topic/add-topic.component';
import { HomeLandingComponent } from './components/home-landing/home-landing.component';
import { ContentTypeComponent } from './components/content-type/content-type.component';
import { AddContentTypeComponent } from './components/add-content-type/add-content-type.component';
import { SubTopicComponent } from './components/sub-topic/sub-topic.component';
import { AddSubTopicComponent } from './components/add-sub-topic/add-sub-topic.component';
import { ChannelComponent } from './components/channel/channel.component';
import { AddChannelComponent } from './components/add-channel/add-channel.component';
import { AccountProfileComponent } from './components/account-profile/account-profile.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { ChangeEmailComponent } from './components/change-email/change-email.component';
import { AuthGuard } from './guards/auth-guard';
import { AdminGuard } from './guards/admin.guard';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { DefaultTopicComponent } from './components/default-topic/default-topic.component';
import { AddDefaultTopicComponent } from './components/add-default-topic/add-default-topic.component';
import { SearchResultsComponent } from './components/search-results/search-results.component';
import { LearnMoreComponent } from './components/learn-more/learn-more.component';

export const routes: Routes = [
  { path: '', component: HomeLandingComponent },
  { path: 'topics', component: TopicComponent, canActivate: [AuthGuard] },
  { path: 'add-topic', component: AddTopicComponent, canActivate: [AuthGuard] },
  { path: 'content-types', component: ContentTypeComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'add-content-type', component: AddContentTypeComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'sub-topics', component: SubTopicComponent, canActivate: [AuthGuard] },
  { path: 'add-sub-topic', component: AddSubTopicComponent, canActivate: [AuthGuard] },
  { path: 'channels', component: ChannelComponent, canActivate: [AuthGuard] },
  { path: 'add-channel', component: AddChannelComponent, canActivate: [AuthGuard] },
  { path: 'account-profile', component: AccountProfileComponent, canActivate: [AuthGuard] },
  { path: 'change-password', component: ChangePasswordComponent, canActivate: [AuthGuard] },
  { path: 'change-email', component: ChangeEmailComponent, canActivate: [AuthGuard] },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'default-topic', component: DefaultTopicComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'add-default-topic', component: AddDefaultTopicComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'search-results', component: SearchResultsComponent, canActivate: [AuthGuard] },
  { path: 'learn-more', component: LearnMoreComponent },
  { path: 'home', redirectTo: '' }
];
