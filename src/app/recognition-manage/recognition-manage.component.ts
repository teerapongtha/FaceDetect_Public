import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DataService } from '../service/data.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recognition-manage',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  providers: [DataService],
  templateUrl: './recognition-manage.component.html',
  styleUrl: './recognition-manage.component.scss'
})

export class RecognitionManageComponent implements OnInit {
  userDataStudent: any[] = [];
  userId: string | undefined;

  constructor(private dataService: DataService, private http: HttpClient) { }

  ngOnInit(): void {
    this.getUserId();
  }

  getUserId(): void {
    this.dataService.getUserData().subscribe(
      (userData: any) => {
        if (userData && userData.std_id) {
          this.userId = userData.std_id;
          this.fetchUserData();
        } else {
          console.error('User ID not found or invalid.');
        }
      },
      (error) => {
        console.error('Error fetching user data:', error);
      }
    );
  }

  fetchUserData(): void {
    if (!this.userId) {
      console.error('User ID is not defined.');
      return;
    }

    this.http.get<any[]>(`${this.dataService.apiUrl}/face-detect-img/${this.userId}`)
      .subscribe(
        data => {
          this.userDataStudent = data;
        },
        error => {
          console.error('Error fetching data:', error);
        }
      );
  }

  deleteImage(imageId: number): void {
    Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'คุณต้องการลบรูปภาพนี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ใช่, ลบ!',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${this.dataService.apiUrl}/face-detect-img-delete/${imageId}`)
          .subscribe(
            () => {
              // ลบข้อมูลในอาร์เรย์ของข้อมูลผู้ใช้
              this.userDataStudent = this.userDataStudent.filter(student => student.img_id !== imageId);
              Swal.fire(
                'ลบเรียบร้อย!',
                'รูปภาพถูกลบแล้ว',
                'success'
              );
            },
            error => {
              console.error('Error deleting image:', error);
              Swal.fire(
                'เกิดข้อผิดพลาด!',
                'ไม่สามารถลบรูปภาพได้',
                'error'
              );
            }
          );
      }
    });
  }
}