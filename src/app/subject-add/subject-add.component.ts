import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DataService } from '../service/data.service';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { AuthService } from '../service/auth.service'; // เพิ่ม import AuthService
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-subject-add',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  providers: [DataService, AuthService],
  templateUrl: './subject-add.component.html',
  styleUrl: './subject-add.component.scss'
})
export class SubjectAddComponent implements OnInit {
  id_subject: any;
  subject_name: any;
  subject_engname: any;
  time_start: any;
  time_end: any;
  teacher_id: any;
  teacher_name: any;

  constructor(private data: DataService, private authService: AuthService, private http: HttpClient, private route: Router) { }

  ngOnInit(): void {
    this.getTeacherInfo();
  }

  getTeacherInfo() {
    this.data.getUserData().subscribe(
      (userData) => {
        if (userData && userData.title && userData.fname && userData.lname && userData.teacher_id) {
          this.teacher_name = `${userData.title} ${userData.fname} ${userData.lname}`;
          this.teacher_id = userData.teacher_id; // เก็บ teacher_id
        } else {
          console.error('Teacher information not available');
        }
      },
      (error) => {
        console.error(error);
      }
    );
  }

  SubjectAdd(): void {
    const SubjectData = {
      id_subject: this.id_subject,
      subject_name: this.subject_name,
      subject_engname: this.subject_engname,
      time_start: this.time_start,
      time_end: this.time_end,
      teacher_id: this.teacher_id // ใช้ teacher_id ตอนบันทึก
    };

    this.http.post<any>(this.data.apiUrl + "/subject-add", SubjectData).subscribe(
      (response) => {
        Swal.fire({
          title: 'เพิ่มรายวิชาใหม่สำเร็จ',
          text: 'บันทึกข้อมูลสำเร็จ',
          icon: 'success',
          confirmButtonText: 'ตกลง'
        }).then((result) => {
          if (result.isConfirmed) {
            this.route.navigate(['/subject-manage']);
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
