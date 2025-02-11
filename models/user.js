class UserBO {
    constructor(email, password, nombre, apellido, user_type, tos_coral) {
        this.email = email;
        this.password = password;
        this.nombre = nombre;
        this.apellido = apellido;
        this.user_type = user_type;
        this.tos_coral = tos_coral;
    }
}

export default UserBO;