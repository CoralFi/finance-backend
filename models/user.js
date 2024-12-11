class UserBO {
    constructor(email, password, nombre, apellido, user_type) {
        this.email = email;
        this.password = password;
        this.nombre = nombre;
        this.apellido = apellido;
        this.user_type = user_type;
    }
}

export default UserBO;