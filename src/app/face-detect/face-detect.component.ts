import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import * as faceapi from 'face-api.js';
import { DataService } from '../service/data.service';

@Component({
  selector: 'app-face-detect',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  providers: [DataService],
  templateUrl: './face-detect.component.html',
  styleUrls: ['./face-detect.component.scss']
})
export class FaceDetectComponent implements AfterViewInit {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  imgStdData: any[] = [];

  constructor(
    private dataService: DataService,
    private http: HttpClient,
    private router: Router
  ) {}

  async ngAfterViewInit() {
    await this.loadFaceAPIModels();
    this.startVideo();
    this.fetchImageData();
  }

  async loadFaceAPIModels() {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/assets/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/assets/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/assets/models'),
      faceapi.nets.faceExpressionNet.loadFromUri('/assets/models')
    ]);
    console.log('โหลดโมเดล Face API เสร็จสิ้น');
  }

  startVideo() {
    const video = this.videoElement.nativeElement;

    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        video.srcObject = stream;
        console.log('เริ่มวิดีโอ');
      })
      .catch(err => console.error('เกิดข้อผิดพลาดในการเข้าถึงกล้อง:', err));

    video.addEventListener('play', () => {
      const canvas = this.canvasElement.nativeElement;
      const displaySize = { width: video.width, height: video.height };
      faceapi.matchDimensions(canvas, displaySize);

      setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptors();

        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        const context = canvas.getContext('2d');
        if (context) {
          context.clearRect(0, 0, canvas.width, canvas.height);
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

          this.checkAndNavigate(resizedDetections);
        }
      }, 100);
    });
  }

  fetchImageData() {
    this.http.get<any[]>(`${this.dataService.apiUrl}/face-detect-img`).subscribe(
      (data: any[]) => {
        this.imgStdData = data;
        console.log('ดึงข้อมูลรูปภาพสำเร็จ');
      },
      (error) => {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูลรูปภาพ:', error);
      }
    );
  }

  async checkAndNavigate(resizedDetections: any[]) {
    const faceDescriptor = resizedDetections.length > 0 ? resizedDetections[0].descriptor : null;

    if (faceDescriptor) {
      console.log('ตรวจพบใบหน้า:', faceDescriptor);
      console.log('ความยาว descriptor ที่ตรวจพบ:', faceDescriptor.length);

      const matchingUser = this.findMatchingUser(faceDescriptor);
      if (matchingUser) {
        const userData = matchingUser.std;
        const fname = userData?.fname ?? 'ไม่พบชื่อ';
        const lname = userData?.lname ?? 'ไม่พบนามสกุล';

        console.log(`พบผู้ใช้: ${fname} ${lname}`);
        
        // Show alert if user is detected
        alert(`พบผู้ใช้: ${fname} ${lname}`);
        
        // Navigate to next page
        this.router.navigate(['/next-page']);
      } else {
        console.log('ไม่พบผู้ใช้ที่ตรงกัน');
      }
    } else {
      console.log('ไม่พบใบหน้าในการตรวจจับ');
    }
  }

  findMatchingUser(faceDescriptor: any) {
    const maxDescriptorDistance = 1.00; // ค่าระยะทางสูงสุดที่ยอมรับได้
    let bestMatch: any = null;
  
    this.imgStdData.forEach((userData) => {
      const savedDescriptor = JSON.parse(userData.extract_feature);
      
      if (userData && userData.std) {
        console.log(`ตรวจสอบใบหน้ากับ: ${userData.std.fname} ${userData.std.lname}`);
        console.log('ค่า descriptor ที่บันทึกไว้:', savedDescriptor);
        console.log('ความยาว descriptor ที่บันทึกไว้:', savedDescriptor.length);
  
        if (faceDescriptor.length === savedDescriptor.length) {
          const distance = faceapi.euclideanDistance(faceDescriptor, savedDescriptor);
          console.log(`ระยะทางไปยัง ${userData.std.fname} ${userData.std.lname}: ${distance}`);
  
          // ตรวจสอบระยะทางก่อนที่จะตัดสินใจเลือก
          if (distance <= maxDescriptorDistance) {
            // สำหรับการเลือกผู้ใช้ที่ใกล้เคียงที่สุด
            if (!bestMatch || distance < bestMatch.distance) {
              bestMatch = { userData, distance };
            }
          }
        } else {
          console.warn('ความยาวของ descriptors ไม่ตรงกัน');
        }
      } else {
        console.warn('ข้อมูลผู้ใช้ไม่ครบถ้วน');
      }
    });
  
    return bestMatch ? bestMatch.userData : null;
  }
  
}