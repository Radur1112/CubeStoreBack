const { PrismaClient } = require('@prisma/client');
const { profileEnd } = require('console');
const prisma = new PrismaClient();
//Obtener listado
module.exports.get = async (request, response, next) => {
  const productos = await prisma.producto.findMany({
    include: { 
      categoria: true,
      usuario: true,
      atributos: true,
      preguntas: {
        select:{
          id: true,
          idUsuario: true,
          idProducto: true,
          descripcion: true,
          fechaExp: true,
          usuario: true,
          respuestas: {
            select:{
              idUsuario: true,
              idPregunta: true,
              descripcion: true,
              fecha: true,
              usuario: true
            }
          }
        }
      },
      facturas: true
    }
  });
  response.json(productos);
};

module.exports.getById = async (request, response, next) => {
    let id = parseInt(request.params.id);
    const producto = await prisma.producto.findUnique({
      where: { id: id },
      include: { 
        categoria: true,
        usuario: true,
        atributos: true,
        preguntas: {
          select:{
            id: true,
            idUsuario: true,
            idProducto: true,
            descripcion: true,
            fechaExp: true,
            usuario: true,
            respuestas: {
              select:{
                  idUsuario: true,
                  idPregunta: true,
                  descripcion: true,
                  fecha: true,
                  usuario: true
              }
            }
          }
        },
        facturas: {
          select: {
            idFactura: true,
            idProducto: true,
            cantidad: true,
            estado: true,
            factura: {
              select: {
                idUsuario: true,
                createdAt: true,
                total: true,
                estado: true,
                usuario: true,
              }
            },
          }
        }
      }
    });
    response.json(producto);
  };

  module.exports.getByVendedorId = async (request, response, next) => {
    let id = parseInt(request.params.id);
    const producto = await prisma.producto.findMany({
      where: { idUsuario: id },
      include: { 
        categoria: true,
        usuario: true,
        atributos: true,
        preguntas: {
          select:{
            id: true,
            idUsuario: true,
            idProducto: true,
            descripcion: true,
            fechaExp: true,
            usuario: true,
            respuestas: {
              select:{
                  idUsuario: true,
                  idPregunta: true,
                  descripcion: true,
                  fecha: true,
                  usuario: true
              }
            }
          }
        },
        facturas: {
          select: {
            idFactura: true,
            idProducto: true,
            cantidad: true,
            estado: true,
            factura: {
              select: {
                idUsuario: true,
                createdAt: true,
                total: true,
                estado: true,
                usuario: true,
              }
            },
          }
        }
      }
    });
    response.json(producto);
  };


//Crear
module.exports.create = async (request, response, next) => {
  let producto = request.body;
  const newProducto = await prisma.producto.create({
    data: {
      usuario: {
        connect: { id: parseInt(producto.idUsuario) },
      },
      categoria: {
        connect: { id: parseInt(producto.idCategoria) },
      },
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      cantidad: parseInt(producto.cantidad),
      estado: producto.estado, 
      atributos: {
        //Generos tiene que ser {id:valor}
        // [{ id: 1 },{id: 3}]
        connect: producto.atributos,
      },
    },
  })
  response.json(newProducto);
};
//Actualizar
module.exports.update = async (request, response, next) => {
  let producto = request.body;
  let idProducto = parseInt(request.params.id);
  //Obtener videojuego viejo
  const productoViejo = await prisma.producto.findUnique({
    where: { id: idProducto },
    include: {
      atributos: {
        select:{
          id:true
        }
      }
    }
  });

  const newProducto = await prisma.producto.update({
    where: {
      id: idProducto,
    },
    data: {
      // idUsuario: producto.idUsuario,
      //idCategoria: producto.idCategoria,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      cantidad: parseInt(producto.cantidad),
      estado: producto.estado, 
      atributos: {
        //Generos tiene que ser {id:valor}
        disconnect:productoViejo.atributos,
        connect: producto.atributos,
      },
    },
  });
  response.json(newProducto);
};

module.exports.updateCantidad = async (request, response, next) => {
  let producto = request.body;
  let idProducto = parseInt(request.params.id);
  //Obtener videojuego viejo
  const productoViejo = await prisma.producto.findUnique({
    where: { id: idProducto },
    include: {
      atributos: {
        select:{
          id:true
        }
      }
    }
  });

  const newProducto = await prisma.producto.update({
    where: {
      id: idProducto,
    },
    data: {
      cantidad: parseInt(productoViejo.cantidad - producto.cantidad)
    },
  });
  response.json(newProducto);
};

module.exports.getTopProds = async (request, response, next) => {
  const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const topSellingProducts = await prisma.producto.findMany({
      include: {
        facturas: {
          where: {
            factura: {
              createdAt: {
                gte: new Date(currentYear, currentMonth, 1),
                lt: new Date(currentYear, currentMonth + 1, 1)
              }
            }
          }
        }
      }
    });
  
    // Calculate the total sales count for each product
    const productsWithSalesCount = topSellingProducts.map(product => ({
      ...product,
      salesCount: product.facturas.reduce((total, factura) => {
        return total + factura.cantidad;
      }, 0)
    }));

  // Sort products by sales count in descending order
  const sortedProducts = productsWithSalesCount.sort((a, b) => b.salesCount - a.salesCount);

  // Get the top 5 products
  const top5SellingProducts = sortedProducts.slice(0, 5);


  response.json(top5SellingProducts);
};

module.exports.getTopProdById = async (request, response, next) => {
  let id = parseInt(request.params.id);

  const topSoldProduct = await prisma.producto.findMany({
    where: {
      idUsuario: id 
    },
    include: {
      facturas: true 
    }
  });

  const productsWithSalesCount = topSoldProduct.map(product => ({
    ...product,
    salesCount: product.facturas.reduce((total, factura) => {
      return total + factura.cantidad;
    }, 0)
  }));

  const sortedProductsUser = productsWithSalesCount.sort((a, b) => b.salesCount - a.salesCount);

  const topSoldProductofUser = sortedProductsUser.slice(0, 1);

  response.json(topSoldProductofUser);
};

module.exports.getTopCompradorByVend = async (request, response, next) => {
  let id = parseInt(request.params.id);
  
  const usersWithProductCount = await prisma.usuario.findMany({
    include: {
      facturas: {
        select: {
          id: true,
          productos: {
            select: {
              idProducto: true,
              cantidad: true,
              producto: {
                select: {
                  idUsuario: true // Select the idUsuario of the related Producto
                }
              }
            },
            where: {
              producto: {
                idUsuario: id // Filter by idUsuario of the related Producto
              }
            }
          }
        }
      }
    }
  });

  // Calculate the total quantity of products bought for each user
  const usersWithTotalProductCount = usersWithProductCount.map(user => ({
    ...user,
    totalProductCount: user.facturas.reduce((total, factura) => {
      return total + factura.productos.reduce((subtotal, producto) => subtotal + producto.cantidad, 0);
    }, 0)
  }));

  // Find the user with the highest total product count
  const userWithMostProducts = usersWithTotalProductCount.reduce((maxUser, currentUser) =>
    currentUser.totalProductCount > maxUser.totalProductCount ? currentUser : maxUser
  );

  response.json(userWithMostProducts);

};



