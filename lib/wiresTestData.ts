export const exampleWireAccounts = [
  {
    title: 'US Bank Account',
    formData: {
      beneficiaryName: 'Satoshi Nakamoto',
      accountNumber: '11111111111',
      routingNumber: '121000248',
      iban: '',
      billingDetails: {
        name: 'Satoshi Nakamoto',
        city: 'Boston',
        country: 'US',
        line1: '100 Money Street',
        line2: 'Suite 1',
        district: 'MA',
        postalCode: '01234',
      },
      bankAddress: {
        country: 'US'
      },
    },
  },
  {
    title: 'German Bank Account',
    formData: {
      beneficiaryName: 'Satoshi Nakamoto',
      accountNumber: '',
      routingNumber: '',
      iban: 'DE31100400480532013000',
      billingDetails: {
        name: 'Satoshi Nakamoto',
        city: 'Boston',
        country: 'US',
        line1: '100 Money Street',
        line2: 'Suite 1',
        district: 'MA',
        postalCode: '01234',
      },
      bankAddress: {
        city: 'Kassel',
        country: 'DE'
      },
    },
  },
  {
    title: 'Mexican Bank Account',
    formData: {
      beneficiaryName: 'Satoshi Nakamoto',
      accountNumber: '002010077777777771',
      routingNumber: 'BDEMMXMF',
      iban: '',
      billingDetails: {
        name: 'Satoshi Nakamoto',
        city: 'Boston',
        country: 'US',
        line1: '100 Money Street',
        line2: 'Suite 1',
        district: 'MA',
        postalCode: '01234',
      },
      bankAddress: {
        bankName: 'Banco Nacional de México',
        city: 'México DF',
        country: 'MX',
        line1: 'Isabel la Católica 165',
        line2: 'Colonia Obrera',
        district: 'México DF',
        postalCode: '06800',
      },
    },
  },
]
