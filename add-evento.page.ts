import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, Validators , FormControl, FormBuilder} from '@angular/forms';
import { Observable } from "rxjs";
import { EventosService } from '../services/evento.service';
import { LoadingController, ModalController } from '@ionic/angular';
import { take } from 'rxjs/operators';
import { Evento } from "../eventos/evento.model";
import { Persona } from "../persona.model";
import { UsuarioService } from "../services/usuario.services";
import { Usuario } from "../add-evento/usuario.model";
import { EMPTY } from 'rxjs';
import { tap } from "rxjs/operators";
import { of, Observer } from 'rxjs';
import {Cedulaservice } from "../services/cedula.services";
import { Imagen } from "../eventos/imagen.model";
import { ActionSheetController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { LoginService } from "../services/login.services";
import { MostrarNotComponent } from "../mostrar-not/mostrar-not.component";

@Component({
  selector: 'app-add-evento',
  templateUrl: './add-evento.page.html',
  styleUrls: ['./add-evento.page.scss'],
})
export class AddEventoPage implements OnInit {
  actionSheetButtons = [
    {
      text: 'Delete',
      icon: 'trash',
      handler: () => {
        // Lógica para manejar la eliminación
      }
    },
    // Otros botones de acción que desees agregar
  ];
  usuarios$: Observable<Usuario[]> = EMPTY;
  cedula$: Observable<any[]> = EMPTY;
  @Input() iseditMode: any;
  @Input() evento: any;
  form: FormGroup;
  opcionSeleccionada: string ='';
  base64Images: any[] = [];
  personas: any[] = [];
  imagenescop: any[] = [];
  imagenescop2: any[] = [];
  usuarioactual: Usuario[]=[];
  usuarioscop: any[]= [];
  usuarioscop2 : any[]=[];
  tipouser: any;
  fechaActual: string;
  customPickerOptions: any;
  horaActual: any;
  titulos: any;
  nuevo_titulo: any = [];
  update_titulo: any = [];
  titulo_sel: any = [];
  update: any;
  nuevo: any;
  delete: any = 0;
  titulotemp: any = [];
  tit: any;
  alert: any;
  reincidentes: any = [];

  

  constructor(private formBuilder: FormBuilder, 
    private eventosService: EventosService, 
    private loadingCtrl: LoadingController,
    private cedulaService: Cedulaservice,
    private modalCtrl: ModalController,
    private actionSheetController: ActionSheetController,
    public alertController: AlertController,
    private loginService: LoginService,
  ) { 
    
    this.form = this.formBuilder.group({
      // detalle: ['', Validators.required],
      fecha: ['', Validators.required],
      hora_inicio: ['', Validators.required],
      // hora_fin: ['', Validators.required],
      responsable: [[], Validators.required],
      comentario_adicional: [''],
      url:[''],
      imagen: [null],
      detalle: [[], Validators.required],
      titulo: [[]],
      titulo_update: [[]],
    });
    this.fechaActual = new Date().toISOString().substring(0, 10);
    this.horaActual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.customPickerOptions = {
      cssClass: 'small-calendar'
    };
    this.tit = 0;
  }


  

async presentAlertEliminarimagen(index: any) {
  const image = this.base64Images[index];
  const alert = await this.alertController.create({
    cssClass: 'my-custom-class',
    header: 'Atencion',
    message: 'Desea eliminar la imagen?',
    buttons: [
      {
        text: 'NO',
        role: 'cancel',
        cssClass: 'secondary',
        handler: () => {
          console.log('Cancel clicked');
          // Agrega la lógica que deseas ejecutar para el botón "Cancel"
        }
      },
      {
        text: 'SI',
        cssClass: 'danger',
        handler: () => {
          console.log('Imagen eliminada');
          this.imagenescop.splice(index,1)
        }
      }
    ],
  });

  await alert.present();
}


async presentAlertEliminarimagen2(index: any) {
  const image = this.base64Images[index];
  console.log(index);
  
  const alert = await this.alertController.create({
    cssClass: 'my-custom-class',
    header: 'Atencion',
    message: 'Desea eliminar la imagen?',
    buttons: [
      {
        text: 'NO',
        role: 'cancel',
        cssClass: 'secondary',
        handler: () => {
          console.log('Cancel clicked');
          // Agrega la lógica que deseas ejecutar para el botón "Cancel"
        }
      },
      {
        text: 'SI',
        cssClass: 'danger',
        handler: () => {
          console.log('Imagen eliminada');
          this.base64Images.splice(index,1);
          console.log(this.base64Images);
        }
      }
    ],
  });

  await alert.present();
}




  validaPersonaRepetida(){
    this.personas = this.personas.filter(item => item.cedula && item.nombres && item.rol)
    for (let index = 0; index < this.personas.length; index++) {
      const element = this.personas[index];
      const validacion = this.personas.filter(item => item.cedula == element.cedula);
      if (validacion.length > 1) {
        console.log(this.personas);
        return true;
      }
    }
    console.log(this.personas);
    return false;
    
    
  }

eliminarPersona(index: number) {

    let eliminar = this.personas[index];
    console.log(eliminar.cedula);
    let indexReincidente = this.reincidentes.findIndex((item: any) => item.cedula === eliminar.cedula);

    if (indexReincidente !== -1) {
    this.reincidentes.splice(indexReincidente, 1);
    }
    this.personas.splice(index, 1); 
    console.log(this.reincidentes);
    
  }


  onSelectChange(event: CustomEvent) {
    const selectedValue = event.detail.value;
    if (selectedValue !== null) {
      // Se ha seleccionado una opción
      console.log('Se ha seleccionado una opción con valor:', selectedValue);
      setTimeout(() => { // Utilizar setTimeout para esperar a que Angular complete su ciclo de detección de cambios
        this.titulo_sel = this.titulos.find((item: { id: any; descripcion:any }) => item.id == selectedValue);
        this.titulo_sel.update = 1;
        this.update = 0;
        this.delete = 0;
        
      });
      this.tit = 1;
    } else {
      // No se ha seleccionado ninguna opción
      console.log('No se ha seleccionado ninguna opción');
    }
  }

  
  
  deleteImage(image: any): void {
    this.imagenescop.splice(image,1)
  }



async enviarValores(){
  if (this.evento.imagenes) {
    this.imagenescop = [...this.evento.imagenes];
  }
  this.personas = this.evento.personas.map((item:Persona)=>{
    return {
      cedula: item.cedula,
      nombres: item.nombres,
      rol: item.rol,

    }
  })
  
  console.log(this.evento);
  this.titulotemp.push({descripcion:this.evento.detalle});
  await this.guardar_titulo2(this.titulotemp);
  await this.cargar_tipo_eve();
  
  
  //COMPROBAR SI EXISTE EVENTO.TITULO
  const detalleValue = this.evento.titulo 
  ? this.evento.titulo.map((item: any) => item.id) 
  : this.titulos
      .filter((item: any) => item.descripcion == this.evento.detalle)
      .map((item: any) => item.id);
      console.log(detalleValue);
  

  this.form.setValue({
    // detalle: this.evento.titulo.map((item: any) => item.id),
    // detalle: this.evento.titulo ? this.evento.titulo.map((item: any) => item.id) : this.titulos.map((item: any) => item.descripcion),
    detalle: detalleValue,
    fecha: this.evento.fecha,
    hora_inicio: this.evento.hora_inicio,
    // hora_fin: this.evento.hora_fin,
    responsable: this.evento.responsables.map((item: any) => item.id_usuario),
    comentario_adicional: this.evento.comentario_adicional,
    imagen: null,
    url: this.evento.url,
    titulo: [[]],
    titulo_update: [[]],
  });
  if (detalleValue !== '' || detalleValue !== null) {
    this.tit = 1;
  }
  
  this.form.updateValueAndValidity();
}





cerrarModal(data = null){
  this.modalCtrl.dismiss(data);
  this.tit= 0;
}
  
async ionViewWillEnter(){
  await this.cargarUsuarios();
  if (!this.iseditMode) {
    this.cargarDatosdefecto();
  }
  await this.cargar_tipo_eve();
  //ESTO SE AUMENTO 17/05/2024
  if(this.evento){
    this.iseditMode = true;
    this.enviarValores();
  }
}


  async ngOnInit() {
    await this.cargarUsuarios();
    await this.cargar_tipo_eve();
     //ESTO SE AUMENTO 17/05/2024
    if(this.evento){
      this.iseditMode = true;
      this.enviarValores();
    }
  }

 async guardarEvento(){
  // if(this.validaPersonaRepetida()) return console.log("REPETIDO");
  let response: Observable<any>;
      if (this.iseditMode) {
        let id = this.evento.id;
        this.imagenescop2 = this.imagenescop.map((item: any) => item.img)
        if(this.base64Images){
          for (const img of this.base64Images) {
            this.imagenescop2.push(img);
          }
        }
        response = this.eventosService.updateEvents(this.form.value, this.imagenescop2, this.personas, id);
        localStorage.setItem('actualizado', 'true');
        
      }
      else{
        console.log(this.base64Images);
        response = this.eventosService.addEvents(this.form.value, this.base64Images, this.personas);
      }
   const cargando = await this.loadingCtrl.create({message: 'Cargando... '})
   cargando.present();
   response
   .pipe(take(1))
   .subscribe((evento)=>{
    this.form.reset();
    this.cargarDatosdefecto();
    this.base64Images.splice(0, this.base64Images.length);
    cargando.dismiss();
    if (this.iseditMode) {
      this.cerrarModal(evento);
     }
   }
   )
   this.personas = [];
   this.form.reset();
   this.tit = 0;
   console.log();
   
    
  }

  add_titulo(){
    if (Object.keys(this.nuevo_titulo).length === 0) {
      this.nuevo_titulo.push({descripcion:'NUEVO TITULO'});
    console.log(this.nuevo_titulo);
    this.nuevo = 1;
    this.delete = 0;
    }
  }

  preparar_update(){
    this.update_titulo.push({id:this.titulo_sel.id, descripcion:this.titulo_sel.descripcion, update:'1'});
    console.log(this.update_titulo);
    this.update = 1;
    this.delete = 0;
  }

  cerrar_titulo(){
    this.update_titulo.splice(0,1);
    this.nuevo_titulo.splice(0,1);
    this.update = 0;
    this.nuevo = 0;
    this.delete = 0;
  }

 async actualizar_titulo(){
    const cargando = await this.loadingCtrl.create({message: 'Cargando... '})
    try {
      const response = await this.eventosService.update_titulos(this.update_titulo[0].id, this.update_titulo[0].descripcion).toPromise();
      if (response.estado == true) {
        console.log('Respuesta exitosa:', response);
         this.nuevo_titulo.splice(0,1);
         this.update_titulo.splice(0,1);
         this.update = 0;
         const alertButtons = [];
        
      alertButtons[0] = {
        text: 'Aceptar',
        handler: () => {
          console.log('Guardar');
        },
      };
  
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: 'Atencion',
        message: response.message,
        buttons: alertButtons
        
      });
      
      cargando.dismiss();
      await alert.present();
      await this.cargar_tipo_eve();
      this.nuevo_titulo.splice(0,1)
        }
    } catch (error) {
      
    }
   
    
  }

  async eliminar_titulo(){
    const cargando = await this.loadingCtrl.create({message: 'Cargando... '})
    let response: any;
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Atencion',
      message: "Desea eliminar este titulo?",
      buttons: [
        {
          text: 'Cancelar',
          handler: () => {
            console.log('Confirm Okay');
          },
        },
        {
          text: 'Aceptar',
          handler: async () => {
            try {
              const response = await this.eventosService.delete_titulos(this.titulo_sel.id).toPromise();
              // Si la petición tiene éxito, puedes realizar acciones aquí
              
            
              if (response.estado == true) {
                console.log('Respuesta exitosa:', response);
                 this.nuevo_titulo.splice(0,1)
                 this.delete = 1;
                 const alertButtons = [];
             
              alertButtons[0] = {
                text: 'Aceptar',
                handler: () => {
                  console.log('Guardar');
                },
              };
          
              const alert2 = await this.alertController.create({
                cssClass: 'my-custom-class',
                header: 'Atencion',
                message: response.message,
                buttons: alertButtons
                
              });
              
              cargando.dismiss();
              await alert2.present();
              this.nuevo_titulo.splice(0,1)
                }
          } catch (error) {
              console.error('Error en la petición:', error);
          } finally {
            await this.cargar_tipo_eve();
            if (cargando) {
              cargando.dismiss();
          }
          
        }
          },
        }
        
      ],
    
    });
    await alert.present();


  }

  async guardar_titulo(){
    const cargando = await this.loadingCtrl.create({message: 'Cargando... '})
    let response: any;
    try {
      const response = await this.eventosService.guardartitulos(this.nuevo_titulo).toPromise();
      // Si la petición tiene éxito, puedes realizar acciones aquí
      
    
      if (response.status == true) {
        console.log('Respuesta exitosa:', response);
         this.nuevo_titulo.splice(0,1)
         const alertButtons = [];
        
      alertButtons[0] = {
        text: 'Aceptar',
        handler: () => {
          console.log('Guardar');
        },
      };
  
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: 'Atencion',
        message: response.message,
        buttons: alertButtons
        
      });
      
      cargando.dismiss();
      await alert.present();
      this.nuevo_titulo.splice(0,1)
      this.nuevo = 0;
        }
  } catch (error) {
      console.error('Error en la petición:', error);
  } finally {
    await this.cargar_tipo_eve();
    if (cargando) {
      cargando.dismiss();
  }
  
}

  }


  async guardar_titulo2(titulotemp: any){
    console.log('TITULO TEMPORAL', titulotemp);
    
    let response: any;
    try {
      const response = await this.eventosService.guardartitulos(titulotemp).toPromise();
      // Si la petición tiene éxito, puedes realizar acciones aquí
      if (response.status == true) {
        console.log('Respuesta exitosa:', response);
         this.titulotemp.splice(0,1)
        }
  } catch (error) {
      console.error('Error en la petición:', error);
  } finally {
    
}
  }


  async cargarcedula(i:any){
    
    const loading = await this.loadingCtrl.create({ message: 'Loading...' })
    loading.present();
    this.cedulaService.obtenerCedula(this.personas[i].cedula)
    .pipe(take(1))
  .subscribe({
    next: async (cedula) => {
      loading.dismiss();
        this.personas[i].nombres=cedula.name
        await this.consultar_persona(this.personas[i].cedula, i);
    },
    error: async (error) => {
      loading.dismiss();
      // Manejo de errores aquí
      console.error('Ocurrió un error:', error);
      const alert = await this.alertController.create({
        cssClass: 'my-custom-class',
        header: 'Atencion',
        message: "Sin servicio de cedula",
        buttons: [
          {
            text: 'Aceptar',
            handler: () => {
              console.log('Confirm Okay');
            },
          },
        ],
      });
      await alert.present();
    },
    complete: () => {
      console.log('COMPLETADO');
    }
  });

   
  }

  

  cargarDatosdefecto(){
    this.usuarioscop2 = [this.usuarioactual];
        for (let index = 0; index < 1; index++) {
          const element = this.usuarioscop2[index].id_usuario;
          this.form.controls['responsable'].setValue([element]);
        }
        this.fechaActual = new Date().toISOString().substring(0, 10);
        this.horaActual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        console.log(this.horaActual);
        
        this.form.controls['hora_inicio'].setValue(this.horaActual);

  }

  async cargarUsuarios(){
    const usuarioJSONString = localStorage.getItem('usuario');
    if (usuarioJSONString !== null){
      const usuario = JSON.parse(usuarioJSONString);
        this.usuarioactual = usuario;
    }
    this.tipouser = localStorage.getItem('tipo_user');
    this.personas = [];
    // if(this.evento){
    //   this.iseditMode = true;
    //   this.enviarValores();
    // }
 

  this.eventosService.getUsuarios().pipe(
    tap(usuarios => {
      // loading.dismiss();
      this.usuarioscop = [...usuarios];
      if (this.tipouser == 1) {
        this.usuarioscop2 = [...this.usuarioscop];
      }
      else{
        this.usuarioscop2 = [this.usuarioactual];
        for (let index = 0; index < 1; index++) {
          const element = this.usuarioscop2[index].id_usuario;
          console.log(this.tipouser);
        }
        console.log(this.form.value);
      }
      return usuarios;
    })
  ).subscribe({
    next: (usuarios) => this.usuarios$ = of(usuarios),
    error: (error) => console.error(error),
    complete: () => {
      // La lógica que deseas ejecutar cuando la suscripción está completa
    }
  } as Observer<Usuario[]>);
  }



  addInvolucrados(){
    let newPerson=[...this.personas]
    newPerson.push({
      cedula:"",
      nombres: "",
      rol: "",
      reincidencias:"",
      r:""
    })
    this.personas=newPerson;
 
    
  }
  agregarPersona() {
    if (this.form.value.cedula && this.form.value.nombres) {
      const nuevaPersona = {
        cedula: this.form.value.cedula,
        nombres: this.form.value.nombres,
        rol: this.form.value.rol,
        reincidencias:"",
        r:""
      };

      this.personas.push(nuevaPersona);

    }
  }

  onFileChange(event: any) {
    const allowedExtensions = ['png', 'jpg', 'jpeg'];
    const files = event.target.files;
    
    if (files && files.length > 0) {
      for (const file of files) {
        const fileName = file.name.toLowerCase();
        const extension = fileName.split('.').pop();
  
        if (allowedExtensions.indexOf(extension) === -1) {
          // Archivo no permitido
          // Puedes mostrar un mensaje de error o realizar otra acción aquí
          console.error('Tipo de archivo no permitido:', fileName);
          // También puedes limpiar el input para evitar la carga del archivo no permitido
          event.target.value = null;
          return;
        }
  
        // El archivo es permitido, puedes continuar con el procesamiento
        console.log('Archivo permitido:', fileName);
      }
      this.base64Images.splice(0, this.base64Images.length);
    const reader = new FileReader();
    
    if (event.target.files && event.target.files.length) {
      const selectedFiles: FileList = event.target.files;

      // this.base64Images = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const reader = new FileReader();
        const file: File = selectedFiles[i];
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (reader.result) {
          const base64String = String(reader.result);
          this.base64Images.push(base64String);
        } else {
          console.error("La propiedad 'result' del lector es null.");
        }
      };
    }
    console.log('Imagenes en base64:', this.base64Images);
    event.target.value = null;
    }
    }
    
  }




  async cargar_tipo_eve(): Promise<void>{
  
    this.eventosService.gettipoeventos().pipe(
      tap(eventos => {
        // localLoading.dismiss();
        return eventos;
      })
    ).subscribe({
      next: async (respuesta: any) => {
      if (respuesta.estado == true) {
        this.titulos = [...respuesta.data];
        console.log(this.titulos);
      }else{
        const alert = await this.alertController.create({
          cssClass: 'my-custom-class',
          header: 'Atencion',
          message: "No existen titulos registrados para el evento",
          buttons: [
            {
              text: 'Aceptar',
              handler: () => {
                console.log('OK');
              },
            },
          ],
        });
        await alert.present();
        console.log("No existen titulos registrados para el evento");
      }
      },
      error: async (error) => {
        const alert = await this.alertController.create({
          cssClass: 'my-custom-class',
          header: 'Atencion',
          message: "No se cargaron titulos para el evento",
          buttons: [
            {
              text: 'Aceptar',
              handler: () => {
                console.log('Confirm Okay');
              },
            },
          ],
        });
        await alert.present();
        console.log("No se cargaron titulos para el evento");
        
      },
      complete: () => {
        
      }
    } as Observer<any[]>);
  
    }
   
    consultar(id_persona:any, indice: any){
      console.log('AQUI LA CONSULTA A LA BASE');
      
      this.eventosService.obtener_tit_pers('1',this.tit,id_persona,this.titulo_sel,'','').pipe(
        tap(persona => {
          // localLoading.dismiss();
          return persona;
        })
      ).subscribe({
        next: async (respuesta: any) => {
        if (respuesta.estado == true) {
          this.personas[indice].r = '1';
          this.personas[indice].reincidencias = [...respuesta.data]
         console.log(respuesta);
         this.reincidentes.push({id:respuesta.persona[0].id, cedula:respuesta.persona[0].cedula, nombres:respuesta.persona[0].nombres, sucesos:respuesta.data})
         this.alert = 1;

         const alert = await this.alertController.create({
          cssClass: 'my-custom-class',
          header: 'Atencion',
          message: "La persona consultada es reincidente en el suceso seleccionado ",
          buttons: [
            {
              text: 'Aceptar',
              handler: () => {
                console.log('OK');
              },
            },
          ],
        });
        await alert.present();


        }
        else{
          if (this.personas[indice].reincidencias && this.personas[indice].r) {
            this.personas[indice].r = '0';
          this.personas[indice].reincidencias.splice(0,1);
          console.log(this.personas);
          }
        }
        },
        error: async (error) => {
          const alert = await this.alertController.create({
            cssClass: 'my-custom-class',
            header: 'Atencion',
            message: error,
            buttons: [
              {
                text: 'Aceptar',
                handler: () => {
                  console.log('Confirm Okay');
                },
              },
            ],
          });
          await alert.present();
          console.log(error);
          
        },
        complete: () => {
          
        }
      } as Observer<any[]>);
    
    }

   async consultar_persona(cedula: any, indice: any){
      
      this.eventosService.consulta_persona(cedula).pipe(
        tap(persona => {
         
          return persona;
        })
      ).subscribe({
        next: async (respuesta: any) => {
        if (respuesta.estado == true) {
          if (this.tit == 1) {
            await this.consultar(respuesta.data[0].id, indice)
          }
        }else{
          const alert = await this.alertController.create({
            cssClass: 'my-custom-class',
            header: 'Atencion',
            message: "No existen personas registradas con esa identificacion",
            buttons: [
              {
                text: 'Aceptar',
                handler: () => {
                  console.log('OK');
                  
                },
              },
            ],
          });
          await alert.present();
          console.log("No existen personas registradas con esa identificacion");
          
        }
        },
        error: async (error) => {
          const alert = await this.alertController.create({
            cssClass: 'my-custom-class',
            header: 'Atencion',
            message: error,
            buttons: [
              {
                text: 'Aceptar',
                handler: () => {
                  console.log('Confirm Okay');
                },
              },
            ],
          });
          await alert.present();
          console.log(error);
          
        },
        complete: () => {
          
        }
      } as Observer<any[]>);
    }

    

    async mostrar_not(i: any){
      console.log('REINCIDENCIAS.', this.personas[i].reincidencias);
      const modal = await this.modalCtrl.create({
        component: MostrarNotComponent, // Reemplaza 'ModalPage' con el nombre de tu página modal
        cssClass: 'my-custom-modal-class', // Clase CSS personalizada para el modal
        componentProps: {
          reincidencias: this.personas[i].reincidencias,
          persona: this.personas[i]
        },
      });
      await modal.present();

  
   }
  
}