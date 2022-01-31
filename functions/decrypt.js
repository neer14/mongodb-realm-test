exports = function(encryptedText){
    const crypto = require('crypto');
    const algorithm = context.values.get('SECURITY_ALGORITHM');
    const key = crypto.scryptSync(context.values.get('SECURITY_KEY'), 'salt', 32);
    const iv = context.values.get('SECURITY_IV');
    const decipher = crypto.createDecipheriv(
      algorithm,
      key,
      Buffer.from(iv, 'hex')
    );
    return (
      decipher.update(encryptedText, 'hex', 'utf8') + decipher.final('utf8')
    );
};