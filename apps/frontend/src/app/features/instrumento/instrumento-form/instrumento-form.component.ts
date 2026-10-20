import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InstrumentoService } from '../services/instrumento.service';
import { LuthierService } from '../../luthier/services/luthier.service';
import { CreateInstrumentoDto, UpdateInstrumentoDto, LuthierDto } from '@luthiers/utils';
import { parseAuthError } from '../../../core/utils/auth-error.util';
import { ValidationMetadataService } from '../../../shared/services/validation-metadata.service';

@Component({
  selector: 'app-instrumento-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './instrumento-form.component.html'
})
export class InstrumentoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private instrumentoService = inject(InstrumentoService);
  private luthierService = inject(LuthierService);

  /**
   * ValidationMetadataService
   *
   * Consome o endpoint GET /meta/validation-rules do backend para obter
   * as regras de validação de forma dinâmica, eliminando validators
   * hardcoded neste componente (ex: Validators.max(50000) e Validators.min(0)
   * que antes estavam fixos no código do cliente).
   */
  protected validationMeta = inject(ValidationMetadataService);

  /**
   * Validators padrão (fallback) usados antes do carregamento dos metadados.
   * Após a carga do ValidationMetadataService, as mensagens de erro passam
   * a ser geradas dinamicamente via validationMeta.getErrorMessage().
   */
  form = this.fb.group({
    modeloMadeira: ['', Validators.required],
    dataEntrada: ['', Validators.required],
    reparoConcluido: [false],
    custoReparo: [0, [Validators.required, Validators.min(0), Validators.max(50000)]],
    luthierId: [null as number | null, Validators.required]
  });

  instrumentoId = signal<number | null>(null);
  isEditMode = computed(() => this.instrumentoId() !== null);
  
  luthiersList = signal<LuthierDto[]>([]);

  initialLoading = signal<boolean>(true);
  saving = signal<boolean>(false);
  globalError = signal<string | null>(null);

  dataAtual = new Date().toISOString().split('T')[0];

  get formattedCusto(): string {
    const val = this.form.get('custoReparo')?.value || 0;
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
  }

  onCustoChange(event: any) {
    let val = event.target.value.replace(/\D/g, '');
    if (!val) {
      this.form.get('custoReparo')?.setValue(0);
      this.form.get('custoReparo')?.markAsDirty();
      event.target.value = '0,00';
      return;
    }
    const num = parseInt(val, 10) / 100;
    this.form.get('custoReparo')?.setValue(num);
    this.form.get('custoReparo')?.markAsDirty();
    
    // Update visual format manually to override native behavior smoothly
    event.target.value = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
  }

  onCustoBlur() {
    this.form.get('custoReparo')?.markAsTouched();
  }

  ngOnInit(): void {
    // Carrega metadados do backend e atualiza validators dinamicamente
    this.validationMeta.load();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.instrumentoId.set(Number(idParam));
    }
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.initialLoading.set(true);
    
    this.luthierService.getAll().subscribe({
      next: (luthiers) => {
        this.luthiersList.set(luthiers);
        
        if (this.isEditMode()) {
          this.loadInstrumento(this.instrumentoId()!);
        } else {
          this.initialLoading.set(false);
        }
      },
      error: () => {
        this.globalError.set('Erro ao carregar a lista de luthiers. Não será possível registrar um instrumento.');
        this.initialLoading.set(false);
      }
    });
  }

  loadInstrumento(id: number): void {
    this.instrumentoService.getById(id).subscribe({
      next: (instrumento) => {
        const dataEntradaFormated = new Date(instrumento.dataEntrada).toISOString().split('T')[0];
        
        this.form.patchValue({
          modeloMadeira: instrumento.modeloMadeira,
          dataEntrada: dataEntradaFormated,
          reparoConcluido: instrumento.reparoConcluido,
          custoReparo: instrumento.custoReparo,
          luthierId: instrumento.luthierId
        });
        this.initialLoading.set(false);
      },
      error: () => {
        this.globalError.set('Erro ao carregar dados do instrumento. Ele pode não existir mais.');
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

    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control?.hasError('backend')) {
        control.setErrors(null);
      }
    });

    const formData = this.form.value;
    const dataToSend = {
      ...formData,
      luthierId: Number(formData.luthierId) // Ensure it is passed as a number
    };

    const request$ = this.isEditMode() 
      ? this.instrumentoService.update(this.instrumentoId()!, dataToSend as UpdateInstrumentoDto)
      : this.instrumentoService.create(dataToSend as CreateInstrumentoDto);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/instrumentos']);
      },
      error: (err) => {
        this.saving.set(false);
        
        if (err.error && err.error.message) {
          this.globalError.set(Array.isArray(err.error.message) ? err.error.message[0] : err.error.message);
        } else {
          this.globalError.set('Erro de validação');
        }
        
        const parsedErrors = parseAuthError(err);
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
   * Substitui mensagens hardcoded anteriores (ex: 'O valor não pode ser maior que R$ 50.000')
   * por mensagens retornadas pelo ValidationMetadataService.
   */
  getFieldError(field: string): string {
    const control = this.form.get(field);
    if (!control) return '';
    return this.validationMeta.getErrorMessage(control, 'instrumento', field);
  }
}
