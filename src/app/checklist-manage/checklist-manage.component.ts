import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Checklist } from '../model/checklist.model';
import { DataService } from '../service/data.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-checklist-manage',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  providers: [DataService],
  templateUrl: './checklist-manage.component.html',
  styleUrl: './checklist-manage.component.scss'
})
export class ChecklistManageComponent implements OnInit {
  checklists: Checklist[] = [];
  subjects: any[] = [];
  selectedSubjectId: any = '';

  constructor(private dataService: DataService, private http: HttpClient, private route: Router) { }

  ngOnInit() {
    this.loadChecklist();
    this.getSubjects();
  }

  getSubjects() {
    this.http.get<any[]>(this.dataService.apiUrl + '/subject-data').subscribe(
      (data) => {
        this.subjects = data;
      },
      (error) => {
        console.error('Error fetching subjects:', error);
      }
    );
  }

  loadChecklist() {
    const url = this.selectedSubjectId 
      ? `${this.dataService.apiUrl}/checklist-data/subject/${this.selectedSubjectId}`
      : `${this.dataService.apiUrl}/checklist`;

    this.http.get<Checklist[]>(url).subscribe(
      (data) => {
        this.checklists = data;
      },
      (error) => {
        console.error('Error fetching checklists:', error);
      }
    );
  }

  onSubjectChange(event: any) {
    this.selectedSubjectId = event.target.value;
    this.loadChecklist(); // เรียกใช้เมื่อเลือกรายวิชาใน dropdown
  }

  DeleteChecklist(checklist_id: number) {
    Swal.fire({
      title: 'คุณแน่ใจที่จะลบรายการนี้หรือไม่?',
      text: 'การกระทำนี้ไม่สามารถยกเลิกได้!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่, ลบรายการนี้',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(this.dataService.apiUrl + `/checklist-delete/${checklist_id}`).subscribe(
          () => {
            this.loadChecklist();
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

  UpdateChecklist(checklist: Checklist) {
    this.route.navigate(['/checklist-update', checklist.checklist_id]);
  }

  getSubjectName(subject_id: any): string {
    const subject = this.subjects.find(s => s.subject_id === subject_id);
    return subject ? subject.subject_name : '';
  }
}