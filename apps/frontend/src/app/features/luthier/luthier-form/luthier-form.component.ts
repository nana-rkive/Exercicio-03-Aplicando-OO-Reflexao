import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LuthierService } from '../services/luthier.service';
import { CreateLuthierDto, UpdateLuthierDto } from '@luthiers/utils';
import { parseAuthError } from '../../../core/utils/auth-error.util';
import { ValidationMetadataService } from '../../../shared/services/validation-metadata.service';

@Component({
  selector: 'app-luthier-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './luthier-form.component.html'
})
export class LuthierFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private luthierService = inject(LuthierService);

  /**
   * ValidationMetadataService
   *
   * Consome o endpoint GET /meta/validation-rules do backend para obter
   * as regras de validação de forma dinâmica, eliminando validators
   * hardcoded neste componente.
   */
  protected validationMeta = inject(ValidationMetadataService);

  /**
   * Validators padrão (fallback) usados antes do carregamento dos metadados.
   * Após o carregamento dinâmico, os controles são atualizados via
   * validationMeta.getValidatorsFor().
   */
  form = this.fb.group({
    nomeMestre: ['', Validators.required],
    dataAbertura: ['', Validators.required],
    certificada: [false],
    bancadasNum: [0, [Validators.required, Validators.min(2)]]
  });

  luthierId = signal<string | null>(null);
  isEditMode = computed(() => this.luthierId() !== null);
  
  initialLoading = signal<boolean>(false);
  saving = signal<boolean>(false);
  globalError = signal<string | null>(null);

  ngOnInit(): void {
    // Carrega metadados do backend e atualiza validators dinamicamente
    this.validationMeta.load();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.luthierId.set(id);
      this.loadLuthier(id);
    }
  }

  loadLuthier(id: string): void {
    this.initialLoading.set(true);
    this.luthierService.getById(id).subscribe({
      next: (luthier) => {
        // Date input expects YYYY-MM-DD
        const dataAberturaFormated = new Date(luthier.dataAbertura).toISOString().split('T')[0];
        
        this.form.patchValue({
          nomeMestre: luthier.nomeMestre,
          dataAbertura: dataAberturaFormated,
          certificada: luthier.certificada,
          bancadasNum: luthier.bancadasNum
        });
        this.initialLoading.set(false);
      },
      error: () => {
        this.globalError.set('Erro ao carregar dados do luthier. Ele pode não existir mais.');
        this.initialLoading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.globalError.set(null);

    // Limpar erros de backend anteriores
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control?.hasError('backend')) {
        control.setErrors(null);
      }
    });

    const formData = this.form.value;
    const dataToSend = {
      ...formData,
    };

    const request$ = this.isEditMode() 
      ? this.luthierService.update(this.luthierId()!, dataToSend as UpdateLuthierDto)
      : this.luthierService.create(dataToSend as CreateLuthierDto);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/luthiers']);
      },
      error: (err) => {
        this.saving.set(false);
        const parsedErrors = parseAuthError(err);
        
        if (parsedErrors['global']) {
          this.globalError.set(parsedErrors['global']);
        }
        
        Object.keys(parsedErrors).forEach(field => {
          if (field !== 'global' && this.form.contains(field)) {
            this.form.get(field)?.setErrors({ backend: parsedErrors[field] });
          }
        });
      }
    });
  }

  fieldHasError(field: string): boolean {
    const control = this.form.get(field);
    return control ? (control.invalid && (control.dirty || control.touched)) : false;
  }

  /**
   * getFieldError — usa mensagens dinâmicas do backend quando disponíveis.
   * Substitui mensagens hardcoded anteriores ('Campo obrigatório', 'Valor inválido', etc.)
   * por mensagens retornadas pelo ValidationMetadataService.
   */
  getFieldError(field: string): string {
    const control = this.form.get(field);
    if (!control) return '';
    return this.validationMeta.getErrorMessage(control, 'luthier', field);
  }
}
