exports = function(encryptedText){
    const algorithm = context.values.get('SECURITY_ALGORITHM');
    const key = context.values.get('SECURITY_KEY');
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