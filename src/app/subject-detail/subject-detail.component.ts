import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../service/data.service';
import { Student } from '../model/student.model';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-subject-detail',
  standalone: true,
  imports: [RouterLink, CommonModule],
  providers: [DataService],
  templateUrl: './subject-detail.component.html',
  styleUrls: ['./subject-detail.component.scss']
})
export class SubjectDetailComponent implements OnInit {
  subject: any = {};
  students: Student[] = [];
  subjectId: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private dataService: DataService
  ) { }

  ngOnInit() {
    this.subjectId = this.route.snapshot.paramMap.get('subjectId') || '';
    this.loadSubjectDetails();
    this.loadStudents();
  }

  loadSubjectDetails() {
    if (this.subjectId) {
      this.http.get<any>(`${this.dataService.apiUrl}/subject-student/${this.subjectId}`).subscribe(
        (data) => {
          this.subject = data.subject;
        },
        (error) => {
          console.error('เกิดข้อผิดพลาดในการดึงข้อมูลวิชา:', error);
        }
      );
    }
  }

  loadStudents() {
    if (this.subjectId) {
      this.http.get<any>(`${this.dataService.apiUrl}/subject-student/${this.subjectId}`).subscribe(
        (data) => {
          this.students = data.students;
        },
        (error) => {
          console.error('เกิดข้อผิดพลาดในการดึงข้อมูลนิสิต:', error);
        }
      );
    }
  }
}
