import { LoadingOverlayService } from './../../services/loading-overlay.service';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { AuthService, Credential } from 'src/app/services/auth.service';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUser, faKey } from '@fortawesome/free-solid-svg-icons';

interface LoginForm {
  username: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule]
})
export class LoginComponent implements OnInit, AfterViewInit {

  icons = {
    user: faUser,
    key: faKey
  }
  fb = inject(FormBuilder);
  authService = inject(AuthService);
  loadingOverlayService = inject(LoadingOverlayService);
  submitted = false;
  form: FormGroup<LoginForm> | null = null;
  private readonly pError = new Subject<string>();
  errorMessage = '';
  @ViewChild('usernameInput', { static: false }) usernameInput: ElementRef<HTMLInputElement> | undefined;
  //@ViewChild('errorAlert', { static: false }) errorAlert: NgbAlert | undefined;

  ngOnInit(): void {
    this.createForm();
    this.pError.subscribe(error => this.errorMessage = error);
    this.pError.pipe(debounceTime(5000)).subscribe(() => {
      /*if (this.errorAlert) {
        this.errorAlert.close();
      }*/
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.usernameFocus();
    }, 1000);
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

  get f() {
    return this.form?.controls;
  }

  submit(): void {
    this.submitted = true;
    const credencial: Credential | undefined = this.form?.value as Credential;
    if (this.form?.valid && credencial) {
      this.authService.login(
        credencial,
        () => this.loadingOverlayService.activate(),
        () => {
          this.authService.getLoggedInUsuario()?.subscribe();
        },
        (err: string) => {
          this.pError.next(err);
          this.usernameFocus();
        },
        () => this.loadingOverlayService.deactivate(),
      );
    }
  }
}
