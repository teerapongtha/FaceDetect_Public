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
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_FORMATS, MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { StudentEditComponent } from './student-edit/student-edit.component';
import { RecognitionManageComponent } from './recognition-manage/recognition-manage.component';
import { FaceRecognitionComponent } from './face-recognition/face-recognition.component';
import { ChecklistStudentComponent } from './checklist-student/checklist-student.component';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

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
    ChecklistStudentComponent,
    SubjectManageComponent,
    StudentManageComponent,
    StudentImportComponent,
    StudentAddComponent,
    StudentEditComponent,
    FaceRecognitionComponent,
    RecognitionManageComponent,
    ReportComponent,
    ReportPersonalComponent,
    ReportWeekComponent,
    ForgetPasswordComponent,
    ProfileComponent,
    ProfileEditComponent,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatSelectModule,
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'th-TH' },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
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
