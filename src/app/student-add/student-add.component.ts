import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DataService } from '../service/data.service';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-student-add',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  providers: [DataService],
  templateUrl: './student-add.component.html',
  styleUrls: ['./student-add.component.scss']
})
export class StudentAddComponent implements OnInit {
  std_id: string = '';
  title: string = '';
  fname: string = '';
  lname: string = '';
  email: string = '';
  subject_id: string = '';
  subjects: any[] = [];
  passwordBeforeHash: string = '';
  teacher_id: string = ''; // เพิ่มตัวแปรสำหรับเก็บ teacher_id

  constructor(private dataService: DataService, private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    this.getUserData();
  }

  // ดึงข้อมูลผู้ใช้เพื่อให้ได้ teacher_id
  getUserData() {
    this.dataService.getUserData().subscribe(userData => {
      if (userData) {
        this.teacher_id = userData.teacher_id; // สมมติว่า teacher_id ถูกเก็บใน userData
        this.getSubjects();
      } else {
        console.error('ไม่พบข้อมูลผู้ใช้');
      }
    });
  }

  // ดึงรายวิชาของอาจารย์คนนั้น
  getSubjects() {
    if (this.teacher_id) {
      this.http.get<any[]>(`${this.dataService.apiUrl}/subjects/${this.teacher_id}`).subscribe((data) => {
        this.subjects = data;
      }, error => {
        console.error('เกิดข้อผิดพลาดในการดึงรายวิชา:', error);
      });
    }
  }

  // เพิ่มข้อมูลนิสิต
  StudentAdd(): void {
    const studentData = {
      std_id: this.std_id,
      title: this.title,
      fname: this.fname,
      lname: this.lname,
      email: this.email,
      subject_id: this.subject_id,
    };

    Swal.fire({
      title: 'กำลังบันทึกข้อมูล...',
      text: 'กรุณารอสักครู่',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.http.post<any>(this.dataService.apiUrl + "/student-add", studentData).subscribe(
      (response) => {
        this.passwordBeforeHash = response.password_before_hash;
        // Send email after successful student addition
        this.sendEmail(response.password_before_hash);
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

  // Send email with student information
  sendEmail(password: string): void {
    const emailData = {
      email: this.email,
      subject: 'Information Student',
      message: `
        <p>สวัสดี,</p>
        <p>ข้อมูลการลงทะเบียนนิสิตใหม่:</p>
        <ul>
          <li><strong>รหัสนิสิต:</strong> ${this.std_id}</li>
          <li><strong>ชื่อ:</strong> ${this.title} ${this.fname} ${this.lname}</li>
          <li><strong>อีเมล:</strong> ${this.email}</li>
          <li><strong>รหัสผ่าน:</strong> ${password}</li>
        </ul>
        <p>กรุณาเปลี่ยนรหัสผ่านหลังจากเข้าสู่ระบบครั้งแรก</p>
        <p>ขอแสดงความนับถือ,</p>
        <p>ทีมงานระบบ</p>
      `,
      isHtml: true // Assuming your backend supports HTML emails
    };

    this.http.post<any>(`${this.dataService.apiUrl}/send-email`, emailData).subscribe(
      (response) => {
        Swal.close(); // Close the loading spinner
        if (response.status === 'success') {
          Swal.fire({
            title: 'เพิ่มข้อมูลนิสิตใหม่สำเร็จ',
            text: 'ข้อมูลนิสิตถูกบันทึกและส่งไปยังอีเมลเรียบร้อยแล้ว',
            icon: 'success',
            confirmButtonText: 'ตกลง'
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(['/student-manage']);
            }
          });
        } else {
          Swal.fire({
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถส่งอีเมลได้',
            icon: 'error',
            confirmButtonText: 'ตกลง'
          });
        }
      },
      (error) => {
        Swal.close(); // Close the loading spinner
        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถส่งอีเมลได้',
          icon: 'error',
          confirmButtonText: 'ตกลง'
        });
        console.error('Error sending email:', error);
      }
    );
  }
}
