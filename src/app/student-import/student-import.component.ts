import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../service/data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-student-import',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  providers: [DataService],
  templateUrl: './student-import.component.html',
  styleUrls: ['./student-import.component.scss']
})
export class StudentImportComponent {
  fileInput: any;
  isLoading = false;

  constructor(private dataService: DataService, private http: HttpClient, private router: Router) {}

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const fileData: string | ArrayBuffer | null = reader.result;
      // ไม่ทำอะไรกับข้อมูลไฟล์ที่เลือกไว้ในตอนนี้ เพราะเราจะอัปโหลดเมื่อกดปุ่ม "อัปโหลด"
    };
    reader.readAsDataURL(file);
  }

  uploadFile() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      const file: File = fileInput.files[0];
      const formData = new FormData();
      formData.append('file', file);

      this.isLoading = true;

      this.http.post<any>(this.dataService.apiUrl + "/student-import", formData).subscribe(
        response => {
          this.isLoading = false;
          Swal.fire({
            title: 'สำเร็จ',
            text: 'นำเข้าข้อมูลนิสิตใหม่สำเร็จ!',
            icon: 'success',
            confirmButtonText: 'ตกลง'
          }).then(() => {
            this.router.navigate(['/student-manage']);
          });
        },
        error => {
          this.isLoading = false;
          console.error('Upload error', error);
          Swal.fire('ผิดพลาด', 'ไม่สามารถนำเข้าข้อมูลได้', 'error');
        }
      );
    } else {
      Swal.fire('ผิดพลาด', 'โปรดเลือกไฟล์ก่อน', 'error');
    }
  }
}
