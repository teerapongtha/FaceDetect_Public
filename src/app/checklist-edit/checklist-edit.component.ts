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
      this.getChecklistData(itemId);
      this.getSubjects();
    });
  }

  getChecklistData(itemId: string) {
    this.http.get(this.dataService.apiUrl + `/checklist-data/${itemId}`).subscribe((data: any) => {
      this.ChecklistUpdate = data;
    });
  }

  getSubjects() {
    this.http.get(this.dataService.apiUrl + '/subject-data').subscribe((data: any) => {
      this.subjects = data;
    });
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
