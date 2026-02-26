import { getDBConnection } from '../db/db.js'

export async function addToCart(req, res) {
    
 const db = await getDBConnection()

console.log(req.session.userId)



if(!req.session.userId){
    console.log('not logged in')
    return res.json({ message: 'You are not logged in' })
    
}

const userCartData = await db.get(`SELECT * FROM cart_items WHERE user_id=? AND product_id=?`,[req.session.userId,Number(req.body.productId)])


  if (userCartData) {
    await db.run(
      `UPDATE cart_items 
       SET quantity = quantity + 1 
       WHERE id=?`,
      [userCartData.id]
    )
    console.log('quantity increased')
    return res.json({ message: 'quantity increased' })
  }

await db.run(`INSERT INTO cart_items(user_id,product_id,quantity) VALUES(?,?,?)`,[req.session.userId,Number(req.body.productId),1])
console.log('added to cart')
res.json({ message: 'Added to Cart' })


}

export async function getCartCount(req, res) {
  const db = await getDBConnection();

   const userId = req.session.userId
   if(userId){
    const count = await db.get(`SELECT COUNT(product_id) FROM cart_items WHERE user_id =?;`,[userId])
    res.json({totalItems:count['COUNT(product_id)']})

   }



}  





export async function getAll(req, res) {

// Don't touch this code!
  if (!req.session.userId) {
    return res.json({err: 'not logged in'})
  }

  const db = await getDBConnection()
  const items = await db.all(`SELECT ci.id AS cartItemId,ci.quantity,p.title,p.artist,p.price FROM cart_items ci INNER JOIN products p ON ci.product_id = p.id WHERE ci.user_id = ?;
`,[req.session.userId])


res.json({items:items})

} 



export async function deleteItem(req, res) {

    const db = await getDBConnection();

    if(!req.params.itemId){
        return res.status(400).json({err: 'invalid item id'})
    }

    await db.run(`DELETE FROM cart_items WHERE id=? AND user_id=?;`,[req.params.itemId,req.session.userId])
    res.status(204).send()


}

export async function deleteAll(req, res) {

  const user = req.session.userId
  const db = await getDBConnection()
  await db.run(`DELETE FROM cart_items WHERE user_id =?`,[user])
  res.status(204).send()


}


