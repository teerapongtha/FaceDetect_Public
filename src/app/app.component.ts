import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
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
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HttpClientModule,
    FormsModule,
    NavbarComponent,
    HomePageComponent,
    LoginComponent,
    ChecklistManageComponent,
    ChecklistEditComponent,
    ChecklistCreateComponent,
    SubjectManageComponent,
    StudentManageComponent,
    StudentImportComponent,
    StudentAddComponent,
    ReportComponent,
    ReportPersonalComponent,
    ReportWeekComponent,
    ForgetPasswordComponent,
    ProfileComponent,
    ProfileEditComponent,
    
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  
})
export class AppComponent {
  title = 'ระบบบันทึกการเข้าเรียนด้วยการสแกนใบหน้า';
  status: boolean = false;
  clickEvent(){
      this.status = !this.status;       
  }
  
}
