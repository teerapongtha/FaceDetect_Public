import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DataService } from '../service/data.service';
import { HttpClient } from '@angular/common/http';
import { Subject } from '../model/subject.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-subject-manage',
  standalone: true,
  imports: [RouterLink, CommonModule],
  providers: [DataService],
  templateUrl: './subject-manage.component.html',
  styleUrl: './subject-manage.component.scss'
})
export class SubjectManageComponent {
  subjects: Subject[] = [];
  constructor(private dataService: DataService, private http: HttpClient, private route:Router) { }

  ngOnInit() {
    this.loadSubject();
  }

  loadSubject() {
    this.http.get(this.dataService.apiUrl + "/subject").subscribe(
      (data: any) => {
        this.subjects = data;
      },
      (error) => {
        console.error('Error fetching students:', error);
      }
    );
  }
  deleteSubject(subject_id: number) {
    Swal.fire({
      title: 'คุณแน่ใจที่จะลบรายการนี้หรือไม่?',
      text: 'การกระทำนี้ไม่สามารถยกเลิกได้!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่, ลบรายการนี้',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(this.dataService.apiUrl + `/subject-delete/${subject_id}`).subscribe(
          () => {
            this.loadSubject();
            Swal.fire(
              'ลบรายการสำเร็จ!',
              'รายการถูกลบแล้ว',
              'success'
            );
          },
          (error) => {
            console.error('เกิดข้อผิดพลาดในการลบรายการ: ', error);
          }
        );
      }
    });
  }
  updateSubject(subject: any) {
    this.route.navigate(['/subject-update', subject.subject_id]);
  }
}
