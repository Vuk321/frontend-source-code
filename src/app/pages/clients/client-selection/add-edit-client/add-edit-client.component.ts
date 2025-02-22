import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {ClientService} from "../../../../@core/data/client.service";
import {CountryService} from "../../../../@core/data/country.service";
import {IndustryService} from "../../../../@core/data/industry.service";
import {NbTokenService} from "@nebular/auth";

@Component({
    selector: 'ngx-add-edit-client',
    templateUrl: './add-edit-client.component.html',
    styleUrls: ['./add-edit-client.component.scss']
})
export class AddEditClientComponent implements OnInit {

    // All the client fields should declare here;
    // name [Input Box]
    // Image [Choose File]
    // workforce [Dropdown] Number of Employees
    // client industry [dropdown]
    // client country [Dropdown], client state [Dropdown, Input box],
    // client products [Dropdown], aggregate_reports [Dropdown], client turnover[Input Box],
    // org_mgt [Dropdown]
    client = {
        name: '', workforce: "", country: '', turnover: "", aggregate_reports: "", industry: '',
        state: '', product: "", org_mgt: "", div_mgt: "", dept_mgt: "", image: ''
    };
    australianState = [
        {name: 'National'},
        {name: 'Australian Antarctic Territory'},
        {name: 'Northern Territory'},
        {name: 'New South Wales'},
        {name: 'Queensland'},
        {name: 'South Australia'},
        {name: 'Tasmania'},
        {name: 'Victoria'},
        {name: 'Western Australia'},
    ];
    user;
    clientId;
    successMessage;
    workforces = [
        {id: 0, value: 'Less than 100'},
        {id: 1, value: '100 - 249'},
        {id: 2, value: '250 - 499'},
        {id: 3, value: '500 - 999'},
        {id: 4, value: '1,000 - 4,999'},
        {id: 5, value: '5,000 +'}
    ];
    products = [
        {id: 0, name: 'RECAP Only'},
        {id: 1, name: 'Exit Interviews Only'},
        {id: 2, name: 'RECAP + Exit Interviews'},
    ];
    aggregate_reports = [
        {id: 0, name: 'Standard'},
        {id: 1, name: 'Enhanced'}
    ];
    levels = [
        {id: 0, name: 'Aggregate Data Only'},
        {id: 1, name: 'Individual + Aggregate Data'},
    ];
    industries = [];

    constructor(private route: ActivatedRoute,
                private clientService: ClientService,
                private countryService: CountryService,
                private industryService: IndustryService,
                private tokenService: NbTokenService,
                private router: Router) {
    }

    ngOnInit() {
        //get the user from the localStorage
        // call the refresh token here
        this.tokenService.get()
            .subscribe(token => {
                this.user = token.getPayload();
            });
        this.clientId = this.route.snapshot.paramMap.get('id');
        if (this.clientId) {
            //get the user from the database and set to the user
            this.getClient();
        }
        this.getIndustries();
        this.createForm();
    }

    clientForm: FormGroup;

    // control reference function
    get(controlName) {
        return this.clientForm.get(controlName);
    }

    onClickIndustries() {
        this.router.navigateByUrl('/pages/clients/client-selection/industries');
    }

    createForm() {
        this.clientForm = new FormGroup({
            name: new FormControl('', Validators.required),
            country: new FormControl('', Validators.required),
            state: new FormControl('', Validators.required),
            industry: new FormControl('', Validators.required),
            workforce: new FormControl('', Validators.required),
            product: new FormControl('', Validators.required),
            turnover: new FormControl(),
            aggregate_reports: new FormControl('', Validators.required),
            org_mgt: new FormControl('', Validators.required),
            div_mgt: new FormControl('', Validators.required),
            dept_mgt: new FormControl('', Validators.required),
            image: new FormControl()
        });
    }

    createClient() {
        if (this.clientForm.valid) {
            //create a new client object instance
            const client = {
                name: this.get('name').value,
                country: this.get('country').value,
                state: this.get('state').value,
                workforce: this.get('workforce').value,
                org_mgt: this.get('org_mgt').value,
                div_mgt: this.get('div_mgt').value,
                dept_mgt: this.get('dept_mgt').value,
                aggregate_reports: this.get('aggregate_reports').value,
                turnover: this.get('turnover').value,
                industry: this.get('industry').value,
                product: this.get('product').value
            };
            if (!this.clientId) {
                this.insert(client);
            } else {
                this.update(client);
            }
        }
    }

    insert(client) {
        this.clientService.createClient(client, this.user._id).subscribe(
            data => {
                this.successMessage = data.message;
                this.setClient(data);
            },
            err => {
                const {error} = err;
                this.clientForm.setErrors({'message': error.message});
            }
        );
    }

    update(client) {
        this.clientService.updateClient(client, this.clientId).subscribe(
            data => {
                this.successMessage = data.message;
                this.setClient(data);
            },
            err => {
                const {error} = err;
                this.clientForm.setErrors({'message': error.message});
                console.log(err);
            }
        );
    }

    getClient() {
        this.clientService.getClient(this.clientId).subscribe(data => {
                this.setClient(data);
            },
            err => {
                console.log(err);
            }
        );
    }

    getIndustries() {
        this.industryService.getIndustries(0, 1000).subscribe(
            data => {
                this.industries = data.industries;
            },
            err => {
                console.log(err);
            }
        );
    }

    setClient(data) {
        this.client.product = data.client.product;
        this.client.industry = data.client.industry;
        this.client.turnover = data.client.turnover;
        this.client.name = data.client.name;
        this.client.country = data.client.country;
        this.client.state = data.client.state;
        this.client.workforce = data.client.workforce;
        this.client.aggregate_reports = data.client.aggregate_reports;
        this.client.org_mgt = data.client.org_mgt;
        this.client.div_mgt = data.client.div_mgt;
        this.client.dept_mgt = data.client.dept_mgt;
        // Finally set the Id of the Client
        this.clientId = data.client._id;
    }

    getCountries() {
        return this.countryService.getCountries();
    }

}
