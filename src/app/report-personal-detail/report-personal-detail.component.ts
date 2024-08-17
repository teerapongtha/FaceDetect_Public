import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DataService } from '../service/data.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-report-personal-detail',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  providers: [DataService],
  templateUrl: './report-personal-detail.component.html',
  styleUrls: ['./report-personal-detail.component.scss']
})
export class ReportPersonalDetailComponent implements OnInit {
  studentId: string = '';
  subjectId: string = '';
  studentDetails: any = {};
  attendanceRecords: any[] = [];
  attendanceSummary: { present: number, late: number, absent: number } = { present: 0, late: 0, absent: 0 };

  constructor(private route: ActivatedRoute, private http: HttpClient, private dataService: DataService) {}

  ngOnInit() {
    this.studentId = this.route.snapshot.paramMap.get('studentId') || '';
    this.subjectId = this.route.snapshot.paramMap.get('subjectId') || '';
    if (this.studentId && this.subjectId) {
      this.getStudentDetails();
      this.getAttendanceRecords();
    }
  }

  getStudentDetails() {
    this.http.get<any>(`${this.dataService.apiUrl}/student-data/${this.studentId}`).subscribe(
      data => {
        this.studentDetails = data;
      },
      error => {
        console.error('Error fetching student details:', error);
      }
    );
  }

  getAttendanceRecords() {
    this.http.get<any[]>(`${this.dataService.apiUrl}/report-personal/${this.studentId}/${this.subjectId}`).subscribe(
      data => {
        this.attendanceRecords = data;
        this.calculateAttendanceSummary();
      },
      error => {
        console.error('Error fetching attendance records:', error);
      }
    );
  }

  calculateAttendanceSummary() {
    this.attendanceSummary.present = this.attendanceRecords.filter(record => record.status === 'มาเรียน').length;
    this.attendanceSummary.late = this.attendanceRecords.filter(record => record.status === 'มาสาย').length;
    this.attendanceSummary.absent = this.attendanceRecords.filter(record => record.status === 'ขาดเรียน').length;
  }
}
