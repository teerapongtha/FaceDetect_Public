import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { DataService } from '../service/data.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-checklist-edit',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, MatDatepickerModule, MatNativeDateModule],
  providers: [DataService],
  templateUrl: './checklist-edit.component.html',
  styleUrls: ['./checklist-edit.component.scss']
})
export class ChecklistEditComponent implements OnInit {
  ChecklistUpdate: any = {};
  subjects: any[] = [];
  teacher_id: string = '';

  constructor(
    private dataService: DataService, 
    private http: HttpClient, 
    private route: ActivatedRoute, 
    private router: Router,
    private dateAdapter: DateAdapter<Date>
  ) { 
    this.dateAdapter.setLocale('th-TH');
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const itemId = params['id'];
      this.getUserData(); // ดึงข้อมูลผู้ใช้เพื่อเอา teacher_id
      this.getChecklistData(itemId);
    });
  }

  getUserData() {
    this.dataService.getUserData().subscribe(userData => {
      if (userData && userData.teacher_id) {
        this.teacher_id = userData.teacher_id;
        this.getSubjects(); // ดึงวิชาหลังจากได้ teacher_id
      } else {
        console.error('ไม่พบข้อมูลผู้ใช้');
      }
    });
  }

  getChecklistData(itemId: string) {
    this.http.get(this.dataService.apiUrl + `/checklist-data/${itemId}`).subscribe((data: any) => {
      this.ChecklistUpdate = data;
    });
  }

  getSubjects() {
    if (this.teacher_id) {
      this.http.get<any[]>(`${this.dataService.apiUrl}/subjects/${this.teacher_id}`).subscribe((data: any) => {
        this.subjects = data;
      });
    }
  }

  UpdateChecklist() {
    this.http.put(this.dataService.apiUrl + `/checklist-update/${this.ChecklistUpdate.checklist_id}`, this.ChecklistUpdate).subscribe(
      () => {
        Swal.fire(
          'แก้ไขรายการสำเร็จ!',
          'รายการถูกแก้ไขแล้ว',
          'success'
        ).then(() => {
          this.router.navigate(['/checklist-manage']);
        });
      },
      (error) => {
        Swal.fire(
          'เกิดข้อผิดพลาด',
          'ไม่สามารถแก้ไขรายการได้',
          'error'
        );
      }
    );
  }
}
