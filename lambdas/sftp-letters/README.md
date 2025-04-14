# Sending proof requests

The `send-proof` lambda within this package is a component in a system for sending files to letter suppliers within the ['NHS Notify Letters CSV SFTP integration protocol'](https://nhsd-confluence.digital.nhs.uk/spaces/RIS/pages/832041921/NHS+Notify+Letters+CSV+SFTP+integration+protocol) system.

The files give the printer what they need to set up the template layout in their system, provide a record of the personalisation fields belonging to the template, and contain specific example personalisation from which the printer produces proof PDFs in response.

Those files are:
- A [PDF](https://nhsd-confluence.digital.nhs.uk/spaces/RIS/pages/832041921/NHS+Notify+Letters+CSV+SFTP+integration+protocol#NHSNotify%7CLettersCSVSFTPintegrationprotocol-NHSNotify%3ARequestingsetupofanewtemplate) which represents a letter layout. Dynamic text segments are included using `((param))` sytax, where 'param' corresponds to the personalisation key.
- A [batch file](https://nhsd-confluence.digital.nhs.uk/spaces/RIS/pages/832041921/NHS+Notify+Letters+CSV+SFTP+integration+protocol#NHSNotify%7CLettersCSVSFTPintegrationprotocol-Batchfileformat) whose format matches (to a large extent) the format of real batches sent to the printer in production by the NHS Notify core system. This synthetic batch contains a row of personalisation for each proof which we are requesting from the printer. 
- A [manifest](https://nhsd-confluence.digital.nhs.uk/spaces/RIS/pages/832041921/NHS+Notify+Letters+CSV+SFTP+integration+protocol#NHSNotify%7CLettersCSVSFTPintegrationprotocol-Manifestfileformat), which accompanines the batch. It being uploaded signals to the printer that the batch file is ready for processing.
