import { LoadingOverlayService } from './../../services/loading-overlay.service';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { Subject, debounceTime } from 'rxjs';
import { AuthService, Credential } from 'src/app/services/auth.service';

interface LoginForm {
  username: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit {
  submitted = false;
  form: FormGroup<LoginForm>|null = null;

  private pError = new Subject<string>();
  errorMessage = '';

  @ViewChild('usernameInput', { static: false }) usernameInput: ElementRef<HTMLInputElement>|undefined;
  @ViewChild('errorAlert', { static: false }) errorAlert: NgbAlert|undefined;

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private loadingOverlayService: LoadingOverlayService) {}

  ngOnInit(): void {
    this.createForm();
    this.pError.subscribe(error => this.errorMessage = error);
    this.pError.pipe(debounceTime(5000)).subscribe(() => {
			if (this.errorAlert) {
				this.errorAlert.close();
			}
		});
  }

  ngAfterViewInit(): void {
    setTimeout(() => { this.usernameFocus(); }, 1000);
  }

  private usernameFocus(): void {
    this.usernameInput?.nativeElement.focus();
  }

  private createForm(): void {
    this.form = this.fb.nonNullable.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  get f() { return this.form?.controls; }

  submit(): void {
    this.submitted = true;
    const credencial: Credential|undefined = this.form?.value as Credential;

    if (this.form?.valid && credencial) {
      this.authService.login(
        credencial,
        () => this.loadingOverlayService.activate(),
        null,
        (err: string) => {
          this.pError.next(err);
          this.usernameFocus();
        },
        () => this.loadingOverlayService.deactivate(),
      );
    }
  }
}
