import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DataService } from '../service/data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../service/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-checklist-create',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  providers: [DataService, AuthService],
  templateUrl: './checklist-create.component.html',
  styleUrls: ['./checklist-create.component.scss']
})
export class ChecklistCreateComponent implements OnInit {
  title: string = '';
  detail: string = '';
  date: string = '';
  time_start: string = '';
  time_end: string = '';
  teacher_id: string = '';
  teacher_name: string = '';
  subject_id: string = '';
  subjects: any[] = [];

  constructor(private data: DataService, private authService: AuthService, private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    this.getTeacherInfo();
    this.getSubjects();
  }

  getSubjects() {
    this.http.get(this.data.apiUrl + '/subject-data').subscribe((data: any) => {
      this.subjects = data;
    });
  }

  getTeacherInfo() {
    this.data.getUserData().subscribe(
      (userData) => {
        if (userData && userData.teacher_id && userData.title && userData.fname && userData.lname) {
          this.teacher_id = userData.teacher_id;
          this.teacher_name = `${userData.title} ${userData.fname} ${userData.lname}`;
        } else {
          console.error('Teacher information not available');
        }
      },
      (error) => {
        console.error(error);
      }
    );
  }

  ChecklistAdd(): void {
    const ChecklistData = {
      title: this.title,
      detail: this.detail,
      date: this.date,
      time_start: this.time_start,
      time_end: this.time_end,
      subject_id: this.subject_id,
      teacher_id: this.teacher_id // Use teacher ID for submission
    };

    this.http.post<any>(this.data.apiUrl + "/checklist-add", ChecklistData).subscribe(
      (response) => {
        Swal.fire({
          title: 'เพิ่มรายวิชาใหม่สำเร็จ',
          text: 'บันทึกข้อมูลสำเร็จ',
          icon: 'success',
          confirmButtonText: 'ตกลง'
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(['/checklist-manage']);
          }
        });
      },
      (error) => {
        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถบันทึกข้อมูลได้',
          icon: 'error',
          confirmButtonText: 'ตกลง'
        });
        console.error(error);
      }
    );
  }
}
