import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import * as faceapi from 'face-api.js';
import { DataService } from '../service/data.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-checklist-attendance',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  providers: [DataService],
  templateUrl: './checklist-attendance.component.html',
  styleUrls: ['./checklist-attendance.component.scss']
})
export class ChecklistAttendanceComponent implements AfterViewInit {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  imgStdData: any[] = [];
  verificationResult: any = null;
  attendance_id: number | null = null;
  checklistId: number | null = null;
  
  date: string;
  currentTime: Date = new Date();

  constructor(
    private dataService: DataService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Initialize date and time
    this.date = new Date().toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok' });
  }

  ngAfterViewInit() {
    this.updateDateTime();
    this.loadFaceAPIModels();
    this.startVideo();
    this.fetchImageData();
  }

  updateDateTime() {
    setInterval(() => {
      this.currentTime = new Date();
      this.date = this.currentTime.toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok' });
    }, 1000); // Update every second
  }

  async loadFaceAPIModels() {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('assets/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('assets/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('assets/models'),
      faceapi.nets.faceExpressionNet.loadFromUri('assets/models')
    ]);
    console.log('โมเดล Face API โหลดเรียบร้อยแล้ว');
  }

  startVideo() {
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
  
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        video.srcObject = stream;
        video.play();
        console.log('กล้องถ่ายรูปเริ่มทำงาน');
      })
      .catch(err => console.error('ข้อผิดพลาดในการเข้าถึงกล้อง:', err));
  
    video.addEventListener('play', () => {
      const canvas = this.canvasElement.nativeElement;
      const displaySize = { width: video.videoWidth, height: video.videoHeight };
      faceapi.matchDimensions(canvas, displaySize);
  
      setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptors();
  
        const resizedDetections = faceapi.resizeResults(detections, faceapi.matchDimensions(canvas, displaySize));
      }, 100);
    });
  }
  

  fetchImageData() {
    this.http.get<any[]>(`${this.dataService.apiUrl}/face-detect-img`).subscribe(
      (data: any[]) => {
        this.imgStdData = data;
        console.log('ดึงข้อมูลภาพเรียบร้อยแล้ว');
      },
      (error) => {
        console.error('ข้อผิดพลาดในการดึงข้อมูลภาพ:', error);
      }
    );
  }

  findMatchingUser(faceDescriptor: any) {
    const maxDescriptorDistance = 0.6;
    let bestMatch: any = null;

    this.imgStdData.forEach((userData) => {
      const savedDescriptor = JSON.parse(userData.extract_feature);

      if (faceDescriptor.length === savedDescriptor.length) {
        const distance = faceapi.euclideanDistance(faceDescriptor, savedDescriptor);
        console.log(`ระยะทางไปยัง ${userData.fname} ${userData.lname}: ${distance}`);
        if (distance <= maxDescriptorDistance) {
          if (!bestMatch || distance < bestMatch.distance) {
            bestMatch = { userData, distance };
          }
        }
      } else {
        console.warn('ความยาวของ Descriptor ไม่ตรงกัน');
      }
    });

    return bestMatch ? bestMatch : null;
  }

  async verifyFace() {
    if (this.checklistId === undefined || this.checklistId === null) {
      Swal.fire({
        title: 'ข้อผิดพลาด',
        text: 'รหัสตรวจสอบไม่ถูกต้อง',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
      return;
    }
  
    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
  
    try {
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();
  
      const displaySize = { width: video.videoWidth, height: video.videoHeight };
      faceapi.matchDimensions(canvas, displaySize);
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
  
      const faceDescriptor = resizedDetections.length > 0 ? resizedDetections[0].descriptor : null;
  
      if (faceDescriptor) {
        const matchingUser = this.findMatchingUser(faceDescriptor);
        if (matchingUser) {
          const userData = matchingUser.userData;
          const distance = matchingUser.distance;
          const fname = userData?.fname ?? 'ไม่ทราบ';
          const lname = userData?.lname ?? 'ไม่ทราบ';
  
          const currentTime = new Date();
          const timeDisplay = currentTime.toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
  
          // Fetch checklist and subject times
          const checklistTimes = await this.http.get<any>(`${this.dataService.apiUrl}/checklist-times/${this.checklistId}`).toPromise();
          const checklistEndTime = new Date(checklistTimes?.checklistEndTime);
          const subjectEndTime = new Date(checklistTimes?.subjectEndTime);
  
          // Determine status based on time comparison
          const timeAttendance = currentTime; // Use the current time as attendance time
  
          let status: string;
          if (timeAttendance > subjectEndTime) {
            status = 'ขาดเรียน'; // Absent
          } else if (timeAttendance > checklistEndTime) {
            status = 'มาสาย'; // Late
          } else {
            status = 'มาเรียน'; // Present
          }
  
          this.verificationResult = {
            fname,
            lname,
            distance: distance.toFixed(2),
            match: distance <= 0.6,
            time: timeDisplay
          };
  
          const imageBlob = await this.captureImageFromVideo(video);
          const formData = new FormData();
          formData.append('img_attendance', imageBlob, 'image.jpg');
          formData.append('std_id', userData.std_id.toString());
          formData.append('status', status);
          formData.append('date_attendance', currentTime.toISOString().split('T')[0]); // Format as YYYY-MM-DD
          formData.append('time_attendance', currentTime.toTimeString().split(' ')[0]); // Format as HH:MM:SS
  
          const saveResponse: any = await this.http.post(`${this.dataService.apiUrl}/checklist-attendance/${this.checklistId}`, formData).toPromise();
          this.attendance_id = saveResponse?.attendance_id || null;
  
          Swal.fire({
            title: 'การตรวจสอบเสร็จสมบูรณ์',
            html: `
              <strong>ชื่อ:</strong> ${this.verificationResult.fname} ${this.verificationResult.lname}<br>
              <strong>สถานะ:</strong> ${status}<br>
              <strong>เวลา:</strong> ${this.verificationResult.time}<br>
              <strong>ผลลัพธ์:</strong> ${this.verificationResult.match ? 'ใบหน้าตรง' : 'ใบหน้าไม่ตรง' }
            `,
            icon: 'success',
            confirmButtonText: 'ตกลง'
          }).then(() => {
            this.router.navigate(['/checklist-student']).then(() => {
              setTimeout(() => {
                window.location.reload();
              }, 500);
            });
          });
        } else {
          Swal.fire({
            title: 'ไม่พบผู้ใช้',
            text: 'ไม่พบผู้ใช้ที่ตรงกับใบหน้าที่ตรวจสอบ',
            icon: 'error',
            confirmButtonText: 'ตกลง'
          });
        }
      }
    } catch (error) {
      console.error('ข้อผิดพลาดในการตรวจสอบใบหน้า:', error);
      Swal.fire({
        title: 'ข้อผิดพลาด',
        text: 'เกิดข้อผิดพลาดในการตรวจสอบใบหน้า',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      });
    }
  }
  
  
  

  captureImageFromVideo(video: HTMLVideoElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to capture image from video.'));
          }
        }, 'image/jpeg');
      } else {
        reject(new Error('Failed to get canvas context.'));
      }
    });
  }

  getCurrentTime() {
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }
  
  ngOnInit() {
    this.getCurrentTime(); // Start updating time
    this.route.paramMap.subscribe(params => {
      this.checklistId = +params.get('id')!;
    });
  }
  
}
