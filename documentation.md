# src
## servicio en general
    Contiene clases con servicios específicos (hashear, enviar emails...) 
    que se pueden compartit en diferentes módulos
### domain
    Define la lógica de negocio. 
    Define estructura y validaciones del modelo
    Tiene las interfaces asociadas a los diferentes modelos
### application
    Define casos de uso
    Define el comportamiento, es agnóstico a la implementación
### infraestructure
    Define repositorios y controladores. Son capas adaptadoras de entrada y salida
