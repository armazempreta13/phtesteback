
/**
 * 🇧🇷 PIX BR CODE GENERATOR (Static Implementation)
 * 
 * Esta biblioteca gera o payload padrão do Banco Central (EMVCo) para PIX Estático.
 * Permite receber pagamentos na sua conta sem precisar de API de banco.
 */

class PixPayload {
    private merchantName: string;
    private merchantCity: string;
    private pixKey: string;
    private amount: string;
    private txId: string;

    constructor(name: string, city: string, key: string, amount: number, txId: string) {
        this.merchantName = this.normalize(name, 25);
        this.merchantCity = this.normalize(city, 15);
        this.pixKey = key.replace(/[^a-zA-Z0-9]/g, ''); // Remove formatação da chave
        this.amount = amount.toFixed(2);
        this.txId = txId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 25).toUpperCase() || '***';
    }

    private normalize(str: string, limit: number): string {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9 ]/g, "") // Apenas alfanumérico e espaços
            .toUpperCase()
            .substring(0, limit);
    }

    private formatField(id: string, value: string): string {
        const len = value.length.toString().padStart(2, '0');
        return `${id}${len}${value}`;
    }

    private getCRC16(payload: string): string {
        payload += '6304'; // Adiciona o ID do CRC antes de calcular
        let polinomio = 0x1021;
        let resultado = 0xFFFF;

        for (let i = 0; i < payload.length; i++) {
            resultado ^= (payload.charCodeAt(i) << 8);
            for (let j = 0; j < 8; j++) {
                if ((resultado & 0x8000) !== 0) {
                    resultado = ((resultado << 1) ^ polinomio) & 0xFFFF;
                } else {
                    resultado = (resultado << 1) & 0xFFFF;
                }
            }
        }
        
        return resultado.toString(16).toUpperCase().padStart(4, '0');
    }

    public generate(): string {
        let payload = '';

        // 00 - Payload Format Indicator
        payload += this.formatField('00', '01');
        
        // 26 - Merchant Account Information (GUI + Key)
        const accountInfo = this.formatField('00', 'br.gov.bcb.pix') + this.formatField('01', this.pixKey);
        payload += this.formatField('26', accountInfo);

        // 52 - Merchant Category Code
        payload += this.formatField('52', '0000');

        // 53 - Transaction Currency (BRL)
        payload += this.formatField('53', '986');

        // 54 - Transaction Amount
        payload += this.formatField('54', this.amount);

        // 58 - Country Code
        payload += this.formatField('58', 'BR');

        // 59 - Merchant Name
        payload += this.formatField('59', this.merchantName);

        // 60 - Merchant City
        payload += this.formatField('60', this.merchantCity);

        // 62 - Additional Data Field Template (TxID)
        const txField = this.formatField('05', this.txId);
        payload += this.formatField('62', txField);

        // 63 - CRC16
        const crc = this.getCRC16(payload);
        
        return `${payload}${crc}`;
    }
}

export const generatePixCode = (
    key: string, 
    name: string, 
    city: string, 
    amount: number, 
    identifier: string = 'PAGAMENTO'
): string => {
    const pix = new PixPayload(name, city, key, amount, identifier);
    return pix.generate();
};
