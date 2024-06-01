import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { NavbarComponent } from './navbar/navbar.component';
import { LoginComponent } from './login/login.component';
import { ChecklistManageComponent } from './checklist-manage/checklist-manage.component';
import { ChecklistEditComponent } from './checklist-edit/checklist-edit.component';
import { ChecklistCreateComponent } from './checklist-create/checklist-create.component';
import { SubjectManageComponent } from './subject-manage/subject-manage.component';
import { ReportComponent } from './report/report.component';
import { StudentManageComponent } from './student-manage/student-manage.component';
import { StudentImportComponent } from './student-import/student-import.component';
import { StudentAddComponent } from './student-add/student-add.component';
import { ReportPersonalComponent } from './report-personal/report-personal.component';
import { ReportWeekComponent } from './report-week/report-week.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { ProfileComponent } from './profile/profile.component';
import { ProfileEditComponent } from './profile-edit/profile-edit.component';
import { SubjectAddComponent } from './subject-add/subject-add.component';
import { SubjectEditComponent } from './subject-edit/subject-edit.component';
import { NgModule } from '@angular/core';
import { StudentEditComponent } from './student-edit/student-edit.component';

export const routes: Routes = [
    { 'path': '', component: HomePageComponent },
    { 'path': 'home', component: HomePageComponent },
    { 'path': 'navbar', component: NavbarComponent },
    { 'path': 'login', component: LoginComponent },
    { 'path': 'forget-password', component: ForgetPasswordComponent },
    { 'path': 'checklist-manage', component: ChecklistManageComponent },
    { 'path': 'checklist-create', component: ChecklistCreateComponent },
    // { 'path': 'checklist-edit', component: ChecklistEditComponent },
    { 'path': 'checklist-update/:id', component: ChecklistEditComponent },
    { 'path': 'profile', component: ProfileComponent },
    { 'path': 'profile-update/:id', component: ProfileEditComponent },
    { 'path': 'report', component: ReportComponent },
    { 'path': 'report-personal', component: ReportPersonalComponent },
    { 'path': 'report-week', component: ReportWeekComponent },
    { 'path': 'subject-manage', component: SubjectManageComponent },
    { 'path': 'subject-add', component: SubjectAddComponent },
    // { 'path': 'subject-edit', component: SubjectEditComponent },
    { 'path': 'subject-update/:id', component: SubjectEditComponent },
    { 'path': 'student-manage', component: StudentManageComponent },
    { 'path': 'student-import', component: StudentImportComponent },
    { 'path': 'student-add', component: StudentAddComponent },
    { 'path': 'student-update/:id', component: StudentEditComponent }
];